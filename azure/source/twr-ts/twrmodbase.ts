
import {twrFloatUtil} from "./twrfloat.js";
import {codePageUTF8, codePage1252, codePageASCII, to1252, toASCII} from "./twrlocale.js"
import {IConsole, IConsoleBase, IConsoleStream, IConsoleCanvas} from "./twrcon.js"

export interface IModOpts {
	stdio?: IConsoleStream&IConsoleBase,
   d2dcanvas?: IConsoleCanvas&IConsoleBase,
	io?: {[key:string]: IConsole},
	windim?:[number, number],
	forecolor?:string,
	backcolor?:string,
	fontsize?:number,
	imports?:{},
}

/*********************************************************************/
/*********************************************************************/
/*********************************************************************/

export abstract class twrWasmModuleBase {
	memory?:WebAssembly.Memory;
	mem8:Uint8Array;
	mem32:Uint32Array;
	memD:Float64Array;
	abstract malloc:(size:number)=>Promise<number>;
	exports?:WebAssembly.Exports;
	isAsyncProxy=false;
	floatUtil:twrFloatUtil;

	constructor() {
		this.mem8=new Uint8Array();  	// avoid type errors
		this.mem32=new Uint32Array();  // avoid type errors
		this.memD=new Float64Array();  // avoid type errors
		this.floatUtil=new twrFloatUtil(this);
		//console.log("size of mem8 after constructor",this.mem8.length);
	}

	/*********************************************************************/
	/*********************************************************************/

	// overridden by twrWasmModuleAsync
	async loadWasm(pathToLoad:string, imports:WebAssembly.ModuleImports, ioNamesToID:{[key:string]:number}) {
		//console.log("fileToLoad",fileToLoad)

		let response;
		try {
			response=await fetch(pathToLoad);
		} catch(err:any) {
			console.log('loadWasm() failed to fetch: '+pathToLoad);
			throw err;
		}
		
		if (!response.ok) throw new Error("fetch response error on file '"+pathToLoad+"'\n"+response.statusText);

		try {
			let wasmBytes = await response.arrayBuffer();

			let instance = await WebAssembly.instantiate(wasmBytes, {env: imports});

			this.exports=instance.instance.exports;
			if (!this.exports) throw new Error("Unexpected error - undefined instance.exports");

			if (this.memory) throw new Error ("unexpected error -- this.memory already set");
			this.memory=this.exports.memory as WebAssembly.Memory;
			if (!this.memory) throw new Error("Unexpected error - undefined exports.memory");
			this.mem8 = new Uint8Array(this.memory.buffer);
			this.mem32 = new Uint32Array(this.memory.buffer);
			this.memD = new Float64Array(this.memory.buffer);

			// SharedArrayBuffer required for twrWasmModuleAsync/twrWasmModuleAsyncProxy
			// instanceof SharedArrayBuffer doesn't work when crossOriginIsolated not enable, and will cause a runtime error
			// (don't check for instanceof SharedArrayBuffer, since it can cause an runtime error when SharedArrayBuffer does not exist)
			if (this.isAsyncProxy) {
				if (this.memory.buffer instanceof ArrayBuffer)
					console.log("twrWasmModuleAsync requires shared Memory. Add wasm-ld --shared-memory --no-check-features (see docs)");
				
				postMessage(["setmemory",this.memory]);
			}

			else {
				// here if twrWasmModule because twrWasmModuleAsync overrides this function, and twrWasmModuleAsyncProxy was handled above

				if (!(this.memory.buffer instanceof ArrayBuffer))
					console.log("twrWasmModule does not require shared Memory. Okay to remove wasm-ld --shared-memory --no-check-features");
			}

			this.malloc=(size:number)=>{
				return new Promise(resolve => {
					const m=this.exports!.malloc as (size:number)=>number;
					resolve(m(size));
				});
		   };

			this.init(ioNamesToID);

		} catch(err:any) {
			console.log('Wasm instantiate error: ' + err + (err.stack ? "\n" + err.stack : ''));
			throw err;
		}
	}

	private init(ioNamesToID:{[key:string]:number}) {
			const twrInit=this.exports!.twr_wasm_init as CallableFunction;
			twrInit(ioNamesToID.stdio, ioNamesToID.stderr, ioNamesToID.std2d==undefined?-1:ioNamesToID.std2d, this.mem8.length);
	}

	/* 
	* this is overridden by twrmodasync (although its worker side will call this version)
	* 
	* callC takes an array where:
	* the first entry is the name of the C function in the Wasm module to call (must be exported, typically via the --export clang flag)
	* and the next entries are a variable number of arguments to pass to the C function, of type
	* number - converted to int32 or float64 as appropriate
	* string - converted to a an index (ptr) into a module Memory returned via stringToMem()
	* URL - the file contents are loaded into module Memory via fetchAndPutURL(), and two C arguments are generated - index (pointer) to the memory, and length
	* ArrayBuffer - the array is loaded into module memory via putArrayBuffer
    */

	async callC(params:[string, ...(string|number|bigint|ArrayBuffer|URL)[]]) {
		const cparams=await this.preCallC(params);
		let retval = await this.callCImpl(params[0], cparams);
		await this.postCallC(cparams, params);
		return retval;
	}

	async callCImpl(fname:string, cparams:(number|bigint)[]=[]) {
		if (!this.exports) throw new Error("this.exports undefined");
		if (!this.exports[fname]) throw new Error("callC: function '"+fname+"' not in export table.  Use --export wasm-ld flag.");

		const f = this.exports[fname] as CallableFunction;
		let cr=f(...cparams);

		return cr;
	}

	// convert an array of arguments to numbers by stuffing contents into malloc'd Wasm memory
	async preCallC(params:[string, ...(string|number|bigint|ArrayBuffer|URL)[]]) {

		if (!(params.constructor === Array)) throw new Error ("callC: params must be array, first arg is function name");
		if (params.length==0) throw new Error("callC: missing function name");

		let cparams:(number|bigint)[]=[];
		let ci=0;
		for (let i=1; i < params.length; i++) {
			const p=params[i];
			switch (typeof p) {
				case 'number':
				case 'bigint':
					cparams[ci++]=p;
					break;
				case 'string':
					cparams[ci++]=await this.putString(p);
					break;
				case 'object':
					if (p instanceof URL) {
						const r=await this.fetchAndPutURL(p);
						cparams[ci++]=r[0];  // mem index
						cparams[ci++]=r[1];   // len
						break;
					}
					else if (p instanceof ArrayBuffer) {
						const r=await this.putArrayBuffer(p);
						cparams[ci++]=r;  // mem index
						break;
					}
				default:
					throw new Error ("callC: invalid object type passed in");
			}
		}

		return cparams;
	}

	// free the mallocs; copy array buffer data from malloc back to arraybuffer
	async postCallC(cparams:(number|bigint)[], params:[string, ...(string|number|bigint|ArrayBuffer|URL)[]]) {

		let ci=0;
		for (let i=1; i < params.length; i++) {
			const p=params[i];
			switch (typeof p) {
				case 'number':
				case 'bigint':
					ci++;
					break;

				case 'string':
					await this.callCImpl('free',[cparams[ci]])
					ci++;
					break;
					
				case 'object':
					if (p instanceof URL) {
						await this.callCImpl('free',[cparams[ci]])
						ci=ci+2;
						break;
					}
					else if (p instanceof ArrayBuffer) {
						const u8=new Uint8Array(p);
						const idx=cparams[ci] as number;
						for (let j=0; j<u8.length; j++) 
							u8[j]=this.mem8[idx+j];   // mod.mem8 is a Uint8Array view of the module's WebAssembly Memory
						await this.callCImpl('free',[idx])
						ci++;
						break;
					}
					else 
						throw new Error ("postCallC: internal error A");

				default:
					throw new Error ("postCallC: internal error B");
			}
		}

		return cparams;
	}

	/*********************************************************************/
	/*********************************************************************/

	// convert a Javascript string into byte sequence that encodes the string using UTF8, or the requested codePage
	stringToU8(sin:string, codePage=codePageUTF8) {

		let ru8:Uint8Array;
		if (codePage==codePageUTF8) {
			const encoder = new TextEncoder();
			ru8=encoder.encode(sin);
		}
		else if (codePage==codePage1252) {
			ru8=new Uint8Array(sin.length);
			for (let i = 0; i < sin.length; i++) {
				ru8[i]=to1252(sin[i]);
			 }
		}
		else if (codePage==codePageASCII) {
			ru8=new Uint8Array(sin.length);
			for (let i = 0; i < sin.length; i++) {
				const r=toASCII(sin[i]);
				ru8[i]=r;
			 }
		}
		else {
			throw new Error("unknown codePage: "+codePage);
		}

		return ru8;
	}

	// copy a string into existing buffer in the webassembly module memory as utf8 (or specified codePage)
	// result always null terminated
	copyString(buffer:number, buffer_size:number, sin:string, codePage=codePageUTF8):void {
		if (buffer_size<1) throw new Error("copyString buffer_size must have length > 0 (room for terminating 0): "+buffer_size);
		
		const ru8=this.stringToU8(sin, codePage);

		let i;
		for (i=0; i<ru8.length && i<buffer_size-1; i++)
			this.mem8[buffer+i]=ru8[i];

		this.mem8[buffer+i]=0;
	}

	// allocate and copy a string into the webassembly module memory as utf8 (or the specified codePage)
	async putString(sin:string, codePage=codePageUTF8) {
		const ru8=this.stringToU8(sin, codePage);
		const strIndex:number=await this.malloc(ru8.length+1);
		this.mem8.set(ru8, strIndex);
		this.mem8[strIndex+ru8.length]=0;

		return strIndex;
	}

	// allocate and copy a Uint8Array into Wasm mod memory
	async putU8(u8a:Uint8Array) {
		let dest:number=await this.malloc(u8a.length); 
		this.mem8.set(u8a, dest);
		return dest;
	}

	async putArrayBuffer(ab:ArrayBuffer) {
		const u8=new Uint8Array(ab);
		return this.putU8(u8);
	}

	// given a url, load its contents, and stuff into Wasm memory similar to Unint8Array
	async fetchAndPutURL(fnin:URL) {

		if (!(typeof fnin === 'object' && fnin instanceof URL))
			throw new Error("fetchAndPutURL param must be URL");

		try {
			let response=await fetch(fnin);
			let buffer = await response.arrayBuffer();
			let src = new Uint8Array(buffer);
			let dest=await this.putU8(src);
			return [dest, src.length];
			
		} catch(err:any) {
			console.log('fetchAndPutURL Error. URL: '+fnin+'\n' + err + (err.stack ? "\n" + err.stack : ''));
			throw err;
		}
	}

	getLong(idx:number): number {
		const idx32=Math.floor(idx/4);
		if (idx32*4!=idx) throw new Error("getLong passed non long aligned address")
		if (idx32<0 || idx32 >= this.mem32.length) throw new Error("invalid index passed to getLong: "+idx+", this.mem32.length: "+this.mem32.length);
		const long:number = this.mem32[idx32];
		return long;
	}
	
	setLong(idx:number, value:number) {
        const idx32 = Math.floor(idx / 4);
        if (idx32 * 4 != idx)
            throw new Error("setLong passed non long aligned address");
        if (idx32 < 0 || idx32 >= this.mem32.length-1)
            throw new Error("invalid index passed to setLong: " + idx + ", this.mem32.length: " + this.mem32.length);
        this.mem32[idx32]=value;
    }

	getDouble(idx:number): number {
		const idx64=Math.floor(idx/8);
		if (idx64*8!=idx) throw new Error("getLong passed non Float64 aligned address")
		const long:number = this.memD[idx64];
		return long;
	}

	setDouble(idx:number, value:number) {
		const idx64=Math.floor(idx/8);
		if (idx64*8!=idx) throw new Error("setDouble passed non Float64 aligned address")
		this.memD[idx64]=value;
	}

	getShort(idx:number): number {
		if (idx<0 || idx>= this.mem8.length) throw new Error("invalid index passed to getShort: "+idx);
		const short:number = this.mem8[idx]+this.mem8[idx+1]*256;
		return short;
	}

	// get a string out of module memory
	// null terminated, up until max of (optional) len bytes
	// len may be longer than the number of characters, if characters are utf-8 encoded
	getString(strIndex:number, len?:number, codePage=codePageUTF8): string {
		if (strIndex<0 || strIndex >= this.mem8.length) throw new Error("invalid strIndex passed to getString: "+strIndex);

		if (len) {
			if (len<0 || len+strIndex > this.mem8.length) throw new Error("invalid len  passed to getString: "+len);
		}
		else {
			len = this.mem8.indexOf(0, strIndex);
			if (len==-1) throw new Error("string is not null terminated");
			len=len-strIndex;
		}

		let encodeFormat;
		if (codePage==codePageUTF8) encodeFormat='utf-8';
		else if (codePage==codePage1252) encodeFormat='windows-1252';
		else throw new Error("Unsupported codePage: "+codePage);

		const td=new TextDecoder(encodeFormat);
		const u8todecode=new Uint8Array(this.mem8.buffer, strIndex, len);

 // chrome throws exception when using TextDecoder on SharedArrayBuffer
 // BUT, instanceof SharedArrayBuffer doesn't work when crossOriginIsolated not enable, and will cause a runtime error, so don't check directly
		if (this.mem8.buffer instanceof ArrayBuffer) { 
			const sout:string = td.decode(u8todecode);
			return sout;
		}
		else {  // must be SharedArrayBuffer
			const regularArrayBuffer = new ArrayBuffer(len);
			const regularUint8Array = new Uint8Array(regularArrayBuffer);
			regularUint8Array.set(u8todecode);
			const sout:string = td.decode(regularUint8Array);
			return sout;
		}
	}

	// get a byte array out of module memory when passed in index to [size, dataptr]
	getU8Arr(idx:number): Uint8Array {
		if (idx<0 || idx>= this.mem8.length) throw new Error("invalid index passed to getU8: "+idx);

		const rv = new Uint32Array( (this.mem8.slice(idx, idx+8)).buffer );
		let size:number=rv[0];
		let dataptr:number=rv[1];

		if (dataptr <0 || dataptr >= (this.mem8.length)) throw new Error("invalid idx.dataptr passed to getU8")
		if (size <0 || size > (this.mem8.length-dataptr)) throw new Error("invalid idx.size passed to  getU8")

		const u8=this.mem8.slice(dataptr, dataptr+size);
		return u8;
	}

	// get a int32 array out of module memory when passed in index to [size, dataptr]
	getU32Arr(idx:number): Uint32Array {
		if (idx<0 || idx>= this.mem8.length) throw new Error("invalid index passed to getU32: "+idx);

		const rv = new Uint32Array( (this.mem8.slice(idx, idx+8)).buffer );
		let size:number=rv[0];
		let dataptr:number=rv[1];

		if (dataptr <0 || dataptr >= (this.mem8.length)) throw new Error("invalid idx.dataptr passed to getU32")
		if (size <0 || size > (this.mem8.length-dataptr)) throw new Error("invalid idx.size passed to  getU32")

		if (size%4!=0) throw new Error("idx.size is not an integer number of 32 bit words");

		const u32 = new Uint32Array( (this.mem8.slice(dataptr, dataptr+size)).buffer );
		return u32;
	}
}
