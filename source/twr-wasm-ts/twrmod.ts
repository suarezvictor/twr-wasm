// class twrWasmModule
// This class provides functions for loading a Web Assembly Module, and calling C code
//
// loadWasm() - loads a compiled wasm file (that is assumed to be linked with the twr wasm runtime library)
//            - options direct where stdout is directed.   The defaults are HTML div "twr_iodiv", then canvas "twr_iocanvas", then debug
//            - is you plan to use stdin, you must use twrWasmAsyncModule
// executeC() - execute a C function exported by the loaded Module.  Handle's numbers, string, files, and Uint8Array as parameters.
// various utility functions
//
// for blocking C functions, see class twrWasmModuleAsync

import {twrDebugLogImpl} from "./twrdebug.js"
import {IModOpts} from "./twrmodbase.js";
import {twrWasmModuleInJSMain} from "./twrmodjsmain.js"
import {twrCanvas} from "./twrcanvas.js";
import {twrTimeImpl} from "./twrdate.js"



export class twrWasmModule extends twrWasmModuleInJSMain {
	 malloc:(size:number)=>Promise<number>;


	constructor(opts:IModOpts={}) {
		super(opts);
		this.malloc=(size:number)=>{throw new Error("error - un-init malloc called")};
		
		this.isWasmModule=true;

		let canvas:twrCanvas;
		if (this.d2dcanvas.isValid()) canvas=this.d2dcanvas;
		else canvas=this.iocanvas;

		this.modParams.imports={
			twrDebugLog:twrDebugLogImpl,
			twrTime:twrTimeImpl,
			twrDivCharOut:this.iodiv.charOut.bind(this.iodiv),
			twrCanvasGetProp:canvas.getProp.bind(canvas),
			twrCanvasDrawSeq:canvas.drawSeq.bind(canvas),
			twrCanvasCharIn:this.null,
			twrCanvasInkey:this.null,
			twrDivCharIn:this.null,
			twrSleep:this.null,

			twrSin:Math.sin,
			twrCos:Math.cos,
			twrTan: Math.tan,
			twrFAbs: Math.abs,
			twrACos: Math.acos,
			twrASin: Math.asin,
			twrATan: Math.atan,
			twrExp: Math.exp,
			twrFloor: Math.floor,
			twrCeil: Math.ceil,
			twrFMod: function(x:number, y:number) {return x%y},
			twrLog: Math.log,
			twrPow: Math.pow,
			twrSqrt: Math.sqrt,
			twrTrunc: Math.trunc,

			twrDtoa: this.floatUtil.dtoa.bind(this.floatUtil),
			twrAtod: this.floatUtil.atod.bind(this.floatUtil),
			twrFcvtS: this.floatUtil.fcvtS.bind(this.floatUtil),
		}
	}

	null(inval?:any) {
		throw new Error("call to unimplemented twrXXX import in twrWasmModule.  Use twrWasmModuleAsync ?");
	}
}




