
import {TCanvasProxyParams} from "./twrcanvas.js"
import {TDivProxyParams} from "./twrdiv.js";
import { TWaitingCallsProxyParams as TWaitingCallsProxyParams } from "./twrwaitingcalls.js"


export type TStdioVals="div"|"canvas"|"null"|"debug";

export interface IModOpts {
	stdio?:TStdioVals, 
	windim?:[number, number],
	forecolor?:string,
	backcolor?:string,
	fontsize?:number,
	isd2dcanvas?:boolean,
	imports?:{},
}

export interface IModParams {
	stdio:TStdioVals, 
	windim:[number, number],
	forecolor:string,
	backcolor:string,
	fontsize:number,
	styleIsDefault: boolean
	isd2dcanvas:boolean,
	imports:{},
}

export interface IModInWorkerParams {
	divProxyParams:TDivProxyParams,
	canvasProxyParams:TCanvasProxyParams,
	waitingCallsProxyParams:TWaitingCallsProxyParams,
}

/*********************************************************************/
/*********************************************************************/
/*********************************************************************/

export abstract class twrWasmModuleBase {
	mem8:Uint8Array;
	memory?:WebAssembly.Memory;
	abstract malloc:(size:number)=>Promise<number>;
	abstract modParams:IModParams;
	exports?:WebAssembly.Exports;
	isWorker=false;

	constructor() {
		this.mem8=new Uint8Array();  // avoid type errors
		//console.log("size of mem8 after constructor",this.mem8.length);
	}

	/*********************************************************************/
	/*********************************************************************/

	async loadWasm(fileToLoad:string) {
		//console.log("fileToLoad",fileToLoad)

		let response;
		try {
			response=await fetch(fileToLoad);
		} catch(err:any) {
			console.log('loadWasm() failed to fetch: '+fileToLoad);
			throw err;
		}
		
		if (!response.ok) throw new Error("fetch response error on file '"+fileToLoad+"'\n"+response.statusText);

		try {
			let wasmBytes = await response.arrayBuffer();

			let allimports:WebAssembly.ModuleImports = { 
				...this.modParams.imports
			};

			let instance = await WebAssembly.instantiate(wasmBytes, {env: allimports});

			this.exports=instance.instance.exports;
			if (!this.exports) throw new Error("Unexpected error - undefined instance.exports");

			if (this.memory) throw new Error ("unexpected error -- this.memory already set");
			this.memory=this.exports.memory as WebAssembly.Memory;
			if (!this.memory) throw new Error("Unexpected error - undefined exports.memory");
			this.mem8 = new Uint8Array(this.memory.buffer);
			//console.log("size of mem8 after creation",this.mem8.length);
			if (this.isWorker) postMessage(["setmemory",this.memory]);

			this.malloc=(size:number)=>{
				return new Promise(resolve => {
					const m=this.exports!.twr_malloc as (size:number)=>number;
					resolve(m(size));
				});
		   };

			this.init();

		} catch(err:any) {
			console.log('WASM instantiate error: ' + err + (err.stack ? "\n" + err.stack : ''));
			throw err;
		}
	}

	private init() {
		//console.log("loadWasm.init() enter")
			let p:number;
			switch (this.modParams.stdio) {
				case "debug":
					p=0;
					break;
				case "div":
					p=1;
					break;
				case "canvas":
					p=2;
					break;
				case "null":
					p=3;
					break;
				default:
					p=0;  // debug
			}

			const twrInit=this.exports!.twr_wasm_init as CallableFunction;
			//console.log("twrInit:",twrInit)
			twrInit(p, this.mem8.length);
	}

	/* executeC takes an array where:
	* the first entry is the name of the C function in the wasm module to call (must be exported, typically via the --export clang flag)
	* and the next entries are a variable number of parameters to pass to the C function, of type
	* number - converted to int32 or float64 as appropriate
	* string - converted to a an index (ptr) into a module Memory returned via stringToMem()
	* URL - the file contents are loaded into module Memory via urlToMem(), and two C parameters are generated - index (pointer) to the memory, and length
	* Uint8Array - the array is loaded into module memory via uint8ArrayToMem(), and two parameters are generated - index (pointer) to the memory, and length
    */

	async executeC(params:[string, ...(string|number|ArrayBuffer|URL)[]]) {
		const cparams=await this.convertParams(params);
		return this.executeCImpl(params[0], cparams);
	}

	async executeCImpl(fname:string, cparams:number[]=[]) {
		if (!this.exports) throw new Error("this.exports undefined");
		if (!this.exports[fname]) throw new Error("executeC: function '"+fname+"' not in export table");

		const f = this.exports[fname] as CallableFunction;
		let cr=f(...cparams);

		return cr;
	}

		// convert an array of parameters to numbers by stuffing contents into wasm
	async convertParams(params:[string, ...(string|number|ArrayBuffer|URL)[]]) {

		if (!(params.constructor === Array)) throw new Error ("executeC: params must be array, first arg is function name");
		if (params.length==0) throw new Error("executeC: missing function name");

		let cparams:number[]=[];
		let ci=0;
		for (let i=1; i < params.length; i++) {
			const p=params[i];
			switch (typeof p) {
				case 'number':
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
					throw new Error ("executeC: invalid object type passed in");
			}
		}

		return cparams;
	}

	/*********************************************************************/
	/*********************************************************************/

	// allocate and copy a string into the webassembly module memory
	async putString(sin:string) {
		let strIndex:number=await this.malloc(sin.length);
		let i;
		for (i=0; i<sin.length; i++)
			this.mem8[strIndex+i]=sin.charCodeAt(i);

		this.mem8[strIndex+i]=0;

		return strIndex;
	}

	async putU8(u8a:Uint8Array) {
		let dest:number=await this.malloc(u8a.length+1); // +1 is hack that basic requires, on my to fix list
		for (let i=0; i<u8a.length; i++)
			this.mem8[dest+i]=u8a[i];

		return dest;
	}

	async putArrayBuffer(ab:ArrayBuffer) {
		const u8=new Uint8Array(ab);
		return this.putU8(u8);
	}

	// given a url, load its contents, and stuff into wasm memory similar to Unint8Array
	async fetchAndPutURL(fnin:URL) {

		if (!(typeof fnin === 'object' && fnin instanceof URL))
			throw new Error("fetchAndPutURL param must be URL");

		try {
			let response=await fetch(fnin);
			let buffer = await response.arrayBuffer();
			let src = new Uint8Array(buffer);
			let dest=await this.putU8(src);
			this.mem8[dest+src.length]=0;   // hack that basic requires.  
			return [dest, src.length+1];
			
		} catch(err:any) {
			console.log('fetchAndPutURL Error. URL: '+fnin+'\n' + err + (err.stack ? "\n" + err.stack : ''));
			throw err;
		}
	}

	getLong(idx:number): number {
		if (idx<0 || idx >= this.mem8.length) throw new Error("invalid index passed to getLong: "+idx+", this.mem8.length: "+this.mem8.length);
		const long:number = this.mem8[idx]+this.mem8[idx+1]*256+this.mem8[idx+2]*256*256+this.mem8[idx+3]*256*256*256;
		return long;
	}

	getShort(idx:number): number {
		if (idx<0 || idx>= this.mem8.length) throw new Error("invalid index passed to getShort: "+idx);
		const short:number = this.mem8[idx]+this.mem8[idx+1]*256;
		return short;
	}

	// get a string out of module memory
	// null terminated, up until max of (optional) len
	getString(strIndex:number, len?:number): string {
		let sout="";

		let i=0;
		while (this.mem8[strIndex+i] && (len===undefined?true:i<len) && (strIndex+i) < this.mem8.length) {
			sout=sout+String.fromCharCode(this.mem8[strIndex+i]);
			i++;
		}

		return sout;
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
