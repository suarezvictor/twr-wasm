import {TModAsyncProxyStartupMsg} from "./twrmodasync.js"
import {twrWasmModuleBase} from "./twrmodbase.js"
import {twrTimeEpochImpl} from "./twrdate.js"
import {twrTimeTmLocalImpl, twrUserLconvImpl, twrUserLanguageImpl, twrRegExpTest1252Impl,twrToLower1252Impl, twrToUpper1252Impl} from "./twrlocale.js"
import {twrStrcollImpl, twrUnicodeCodePointToCodePageImpl, twrCodePageToUnicodeCodePoint, twrGetDtnamesImpl} from "./twrlocale.js"
import {twrConsoleDivProxy} from "./twrcondiv.js";
import {twrWaitingCallsProxy, TWaitingCallsProxyParams} from "./twrwaitingcalls.js";
import {IConsoleProxy, TConsoleProxyParams} from "./twrcon.js"
import {twrConsoleCanvasProxy} from "./twrconcanvas.js";
import {twrConsoleDebugProxy} from "./twrcondebug.js"
import {twrConsoleTerminalProxy} from "./twrconterm.js"
import {twrConsoleProxyRegistry} from "./twrconreg.js"

export interface IAllProxyParams {
	conProxyParams: TConsoleProxyParams[],  // everything needed to create matching IConsoleProxy for each IConsole and twrConsoleProxyRegistry
	ioNamesToID: {[key:string]: number},  // name to id mappings for this module
	waitingCallsProxyParams:TWaitingCallsProxyParams,
}

let mod:twrWasmModuleAsyncProxy;

self.onmessage = function(e) {
    //console.log('twrworker.js: message received from main script: '+e.data);

    if (e.data[0]=='startup') {
        const params:TModAsyncProxyStartupMsg=e.data[1];
        //console.log("Worker startup params:",params);
        mod=new twrWasmModuleAsyncProxy(params.allProxyParams);

        mod.loadWasm(params.urlToLoad).then( ()=> {
            postMessage(["startupOkay"]);
        }).catch( (ex)=> {
            console.log(".catch: ", ex);
            postMessage(["startupFail", ex]);
        });
    }
    else if (e.data[0]=='callC') {
         const [msg, id, funcName, cparams]=e.data;
         mod.callCImpl(funcName, cparams).then( (rc)=> {
            postMessage(["callCOkay", id, rc]);
        }).catch(ex => {
            console.log("exception in callC in 'twrmodasyncproxy.js': \n", e.data[1], e.data[2]);
            console.log(ex);
            postMessage(["callCFail", id, ex]);
        });
    }
    else {
        console.log("twrmodasyncproxy.js: unknown message: "+e);
    }
}

// ************************************************************************

export class twrWasmModuleAsyncProxy extends twrWasmModuleBase {
   malloc:(size:number)=>Promise<number>;
   imports:WebAssembly.ModuleImports;
	ioNamesToID: {[key:string]: number};   // ioName to IConsole.id
   cpTranslate:twrCodePageToUnicodeCodePoint;

	private getProxyInstance(params:TConsoleProxyParams): IConsoleProxy {

		const className=params[0];
		switch (className) {
			case "twrConsoleDivProxy":
				 return new twrConsoleDivProxy(params);

			case "twrConsoleTerminalProxy":
				return new twrConsoleTerminalProxy(params);

			case "twrConsoleDebugProxy":
				return new twrConsoleDebugProxy(params);

         case "twrConsoleCanvasProxy":
            return new twrConsoleCanvasProxy(params);

			default:
				throw new Error("Unknown class name passed to getProxyClassConstructor: "+className);
		}
	}

   constructor(allProxyParams:IAllProxyParams) {
      super();
      this.isAsyncProxy=true;
      this.malloc=(size:number)=>{throw new Error("error - un-init malloc called")};
		this.cpTranslate=new twrCodePageToUnicodeCodePoint();

		this.ioNamesToID=allProxyParams.ioNamesToID;

		// create IConsoleProxy versions of each IConsole
		for (let i=0; i<allProxyParams.conProxyParams.length; i++) {
			const params=allProxyParams.conProxyParams[i];
			const con:IConsoleProxy = this.getProxyInstance(params);
			twrConsoleProxyRegistry.registerConsoleProxy(con)
		}
			
      const waitingCallsProxy = new twrWaitingCallsProxy(allProxyParams.waitingCallsProxyParams);

      const conProxyCall = (funcName: keyof IConsoleProxy, jsid:number, ...args: any[]):any => {
			const con=twrConsoleProxyRegistry.getConsoleProxy(jsid);
			const f=con[funcName] as (...args: any[]) => any;
         if (!f) throw new Error(`Likely using an incorrect console type. jsid=${jsid}, funcName=${funcName}`);
			return f.call(con, ...args);
      }

      const conSetRange = (jsid:number, chars:number, start:number, len:number) => {
         let values=[];
         for (let i=start; i<start+len; i++) {
            values.push(this.getLong(i));
         }
         conProxyCall("setRange", jsid, start, values);
      }

      const conPutStr = (jsid:number, chars:number, codePage:number) => {
         conProxyCall("putStr", jsid, this.getString(chars), codePage);
      }

      const conGetProp = (jsid:number, pn:number) => {
         const propName=this.getString(pn);
         return conProxyCall("getProp", jsid, propName);
      }

      const conDrawSeq = (jsid:number, ds:number) => {
         conProxyCall("drawSeq", jsid, ds, this);
      }

		const twrGetConIDFromNameImpl = (nameIdx:number):number => {
			const name=this.getString(nameIdx);
			const id=this.ioNamesToID[name];
			if (id)
				return id;
			else
				return -1;
		}

      this.imports={
         twrTimeEpoch:twrTimeEpochImpl,
         twrTimeTmLocal:twrTimeTmLocalImpl.bind(this),
         twrUserLconv:twrUserLconvImpl.bind(this),
         twrUserLanguage:twrUserLanguageImpl.bind(this),
         twrRegExpTest1252:twrRegExpTest1252Impl.bind(this),
         twrToLower1252:twrToLower1252Impl.bind(this),
         twrToUpper1252:twrToUpper1252Impl.bind(this),
         twrStrcoll:twrStrcollImpl.bind(this),
         twrUnicodeCodePointToCodePage:twrUnicodeCodePointToCodePageImpl.bind(this),
         twrCodePageToUnicodeCodePoint:this.cpTranslate.convert.bind(this.cpTranslate),
         twrGetDtnames:twrGetDtnamesImpl.bind(this),
			twrGetConIDFromName: twrGetConIDFromNameImpl,

         twrSleep:waitingCallsProxy.sleep.bind(waitingCallsProxy),

         twrConCharOut:conProxyCall.bind(null, "charOut"),
         twrConCharIn:conProxyCall.bind(null, "charIn"),
         twrSetFocus:conProxyCall.bind(null, "setFocus"),

         twrConGetProp:conGetProp,
         twrConCls:conProxyCall.bind(null, "cls"),
         twrConSetC32:conProxyCall.bind(null, "setC32"),
         twrConSetReset:conProxyCall.bind(null, "setReset"),
         twrConPoint:conProxyCall.bind(null, "point"),
         twrConSetCursor:conProxyCall.bind(null, "setCursor"),
         twrConSetColors:conProxyCall.bind(null, "setColors"),
         twrConSetRange:conSetRange,
         twrConPutStr:conPutStr,

         twrConDrawSeq:conDrawSeq,
         twrConLoadImage: conProxyCall.bind(null, "loadImage"),

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
         twrToFixed: this.floatUtil.toFixed.bind(this.floatUtil),
         twrToExponential: this.floatUtil.toExponential.bind(this.floatUtil),
         twrAtod: this.floatUtil.atod.bind(this.floatUtil),
         twrFcvtS: this.floatUtil.fcvtS.bind(this.floatUtil)
      }
   }

	async loadWasm(pathToLoad:string) {
      return super.loadWasm(pathToLoad, this.imports, this.ioNamesToID);
   }
}


