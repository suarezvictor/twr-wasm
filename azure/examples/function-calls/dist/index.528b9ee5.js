function e(e,t,r,i){Object.defineProperty(e,t,{get:r,set:i,enumerable:!0,configurable:!0})}var t=globalThis,r={},i={},s=t.parcelRequire94c2;null==s&&((s=function(e){if(e in r)return r[e].exports;if(e in i){var t=i[e];delete i[e];var s={id:e,exports:{}};return r[e]=s,t.call(s.exports,s,s.exports),s.exports}var o=Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}).register=function(e,t){i[e]=t},t.parcelRequire94c2=s);var o=s.register;o("eZoLj",function(t,r){e(t.exports,"register",()=>i,e=>i=e);var i,s=new Map;i=function(e,t){for(var r=0;r<t.length-1;r+=2)s.set(t[r],{baseUrl:e,path:t[r+1]})}}),o("4mNsm",function(t,r){e(t.exports,"twrWasmModule",()=>s("3bkoq").twrWasmModule),e(t.exports,"twrWasmModuleAsync",()=>s("baOio").twrWasmModuleAsync),s("3bkoq"),s("baOio")}),o("3bkoq",function(t,r){e(t.exports,"twrWasmModule",()=>a);var i=s("9FI45"),o=s("aGUWE"),n=s("lsUl2");class a extends o.twrWasmModuleInJSMain{malloc;constructor(e={}){let t;super(e,!0),this.malloc=e=>{throw Error("error - un-init malloc called")},t=this.d2dcanvas.isValid()?this.d2dcanvas:this.iocanvas,this.modParams.imports={twrDebugLog:i.twrDebugLogImpl,twrTime:n.twrTimeImpl,twrDivCharOut:this.iodiv.charOut.bind(this.iodiv),twrCanvasGetProp:t.getProp.bind(t),twrCanvasDrawSeq:t.drawSeq.bind(t),twrCanvasCharIn:this.null,twrCanvasInkey:this.null,twrDivCharIn:this.null,twrSleep:this.null,twrSin:Math.sin,twrCos:Math.cos,twrTan:Math.tan,twrFAbs:Math.abs,twrACos:Math.acos,twrASin:Math.asin,twrATan:Math.atan,twrExp:Math.exp,twrFloor:Math.floor,twrCeil:Math.ceil,twrFMod:function(e,t){return e%t},twrLog:Math.log,twrPow:Math.pow,twrSqrt:Math.sqrt,twrTrunc:Math.trunc,twrDtoa:this.floatUtil.dtoa.bind(this.floatUtil),twrToFixed:this.floatUtil.toFixed.bind(this.floatUtil),twrToExponential:this.floatUtil.toExponential.bind(this.floatUtil),twrAtod:this.floatUtil.atod.bind(this.floatUtil),twrFcvtS:this.floatUtil.fcvtS.bind(this.floatUtil)}}null(e){throw Error("call to unimplemented twrXXX import in twrWasmModule.  Use twrWasmModuleAsync ?")}}}),o("9FI45",function(t,r){e(t.exports,"twrDebugLogImpl",()=>s);let i="";function s(e){10==e||3==e?(console.log(i),i=""):(i+=String.fromCharCode(e)).length>=200&&(console.log(i),i="")}}),o("aGUWE",function(t,r){e(t.exports,"twrWasmModuleInJSMain",()=>a);var i=s("fDEU7"),o=s("5hO33"),n=s("5LsZ0");class a extends o.twrWasmModuleBase{iocanvas;d2dcanvas;iodiv;modParams;constructor(e={},t=!1){if(super(t),"undefined"==typeof document)throw Error("twrWasmModuleJSMain should only be created in JavaScript Main.");let r=document.getElementById("twr_iodiv"),s=document.getElementById("twr_iocanvas"),o=document.getElementById("twr_d2dcanvas");if(s&&o)throw Error("Both twr_iocanvas and twr_d2dcanvas defined. Currently only one canvas allowed.");if("div"==e.stdio&&!r)throw Error("twrWasmModuleBase opts=='div' but twr_iodiv not defined");if("canvas"==e.stdio&&!s)throw Error("twrWasmModuleBase, opts=='canvas' but twr_iocanvas not defined");if(e.isd2dcanvas&&!o)throw Error("twrWasmModuleBase, opts.isdrawcanvas==true but twr_d2dcanvas not defined");e=r?{stdio:"div",...e}:s?{stdio:"canvas",...e}:{stdio:"debug",...e},r||s?console.log("tiny-wasm-runtime: stdio set to: ",e.stdio):console.log("Since neither twr_iocanvas nor twr_iodiv is defined, stdout directed to debug console."),(e=s?{windim:[64,16],...e}:{windim:[0,0],...e}).imports||(e.imports={});let a=!1;e.backcolor||(a=!0,e.backcolor="black"),e.forecolor||(a=!0,e.forecolor="white"),e.fontsize||(a=!0,e.fontsize=16),void 0===e.isd2dcanvas&&(o?e.isd2dcanvas=!0:e.isd2dcanvas=!1),this.modParams={stdio:e.stdio,windim:e.windim,imports:e.imports,forecolor:e.forecolor,backcolor:e.backcolor,styleIsDefault:a,fontsize:e.fontsize,isd2dcanvas:e.isd2dcanvas},this.iodiv=new i.twrDiv(r,this.modParams,this),this.iocanvas=new n.twrCanvas(s,this.modParams,this),this.d2dcanvas=new n.twrCanvas(o,this.modParams,this)}divLog(...e){for(var t=0;t<e.length;t++)this.iodiv.stringOut(e[t].toString()),this.iodiv.charOut(32);this.iodiv.charOut(10)}}}),o("fDEU7",function(t,r){e(t.exports,"twrDiv",()=>o);var i=s("ghrAp");class o{div;divKeys;CURSOR=String.fromCharCode(9611);cursorOn=!1;lastChar=0;extraBR=!1;owner;constructor(e,t,r){this.div=e,this.owner=r,this.owner.isWasmModule||(this.divKeys=new i.twrSharedCircularBuffer),this.div&&!t.styleIsDefault&&(this.div.style.backgroundColor=t.backcolor,this.div.style.color=t.forecolor,this.div.style.font=t.fontsize.toString()+"px arial")}isValid(){return!!this.div}getProxyParams(){if(!this.divKeys)throw Error("internal error in getProxyParams.");return[this.divKeys.sharedArray]}charOut(e){if(this.div){switch(this.extraBR&&(this.extraBR=!1,this.cursorOn&&(this.div.innerHTML=this.div.innerHTML.slice(0,-1)),this.div.innerHTML=this.div.innerHTML.slice(0,-4),this.cursorOn&&(this.div.innerHTML+=this.CURSOR)),e){case 10:case 13:if(10==e&&13==this.lastChar)break;this.cursorOn&&(this.div.innerHTML=this.div.innerHTML.slice(0,-1)),this.div.innerHTML+="<br><br>",this.extraBR=!0,this.cursorOn&&(this.div.innerHTML+=this.CURSOR);let t=this.div.getBoundingClientRect();window.scrollTo(0,t.height+100);break;case 8:this.cursorOn&&(this.div.innerHTML=this.div.innerHTML.slice(0,-1)),this.div.innerHTML=this.div.innerHTML.slice(0,-1),this.cursorOn&&(this.div.innerHTML+=this.CURSOR);break;case 14:this.cursorOn||(this.cursorOn=!0,this.div.innerHTML+=this.CURSOR,this.div.focus());break;case 15:this.cursorOn&&(this.cursorOn=!1,this.div.innerHTML=this.div.innerHTML.slice(0,-1));break;default:this.cursorOn&&(this.div.innerHTML=this.div.innerHTML.slice(0,-1)),this.div.innerHTML+=String.fromCharCode(e),this.cursorOn&&(this.div.innerHTML+=this.CURSOR)}this.lastChar=e}}stringOut(e){for(let t=0;t<e.length;t++)this.charOut(e.charCodeAt(t))}}}),o("ghrAp",function(t,r){e(t.exports,"twrSharedCircularBuffer",()=>i);class i{sharedArray;buf;constructor(e){if("undefined"!=typeof window&&!crossOriginIsolated&&"file:"!==window.location.protocol)throw Error("twrSharedCircularBuffer constructor, crossOriginIsolated="+crossOriginIsolated+". See SharedArrayBuffer docs.");e?this.sharedArray=e:this.sharedArray=new SharedArrayBuffer(1032),this.buf=new Int32Array(this.sharedArray),this.buf[256]=0,this.buf[257]=0}write(e){let t=this.buf[257];this.buf[t]=e,256==++t&&(t=0),this.buf[257]=t,Atomics.notify(this.buf,257)}read(){if(this.isEmpty())return -1;{let e=this.buf[256],t=this.buf[e];return e++,this.buf[256]=e,t}}readWait(){if(this.isEmpty()){let e=this.buf[256];Atomics.wait(this.buf,257,e)}return this.read()}isEmpty(){return this.buf[256]==this.buf[257]}}}),o("5hO33",function(t,r){e(t.exports,"twrWasmModuleBase",()=>o);var i=s("2Xdsi");class o{memory;mem8;mem32;memD;exports;isWorker=!1;isWasmModule;floatUtil;constructor(e=!1){this.isWasmModule=e,this.mem8=new Uint8Array,this.mem32=new Uint32Array,this.memD=new Float64Array,this.floatUtil=new i.twrFloatUtil(this)}async loadWasm(e){let t;try{t=await fetch(e)}catch(t){throw console.log("loadWasm() failed to fetch: "+e),t}if(!t.ok)throw Error("fetch response error on file '"+e+"'\n"+t.statusText);try{let e=await t.arrayBuffer(),r={...this.modParams.imports},i=await WebAssembly.instantiate(e,{env:r});if(this.exports=i.instance.exports,!this.exports)throw Error("Unexpected error - undefined instance.exports");if(this.memory)throw Error("unexpected error -- this.memory already set");if(this.memory=this.exports.memory,!this.memory)throw Error("Unexpected error - undefined exports.memory");this.mem8=new Uint8Array(this.memory.buffer),this.mem32=new Uint32Array(this.memory.buffer),this.memD=new Float64Array(this.memory.buffer),this.isWorker&&(this.memory.buffer instanceof ArrayBuffer&&console.log("twrWasmModuleAsync requires shared Memory. Add wasm-ld --shared-memory --no-check-features (see docs)"),postMessage(["setmemory",this.memory])),!this.isWasmModule||this.memory.buffer instanceof ArrayBuffer||console.log("twrWasmModule does not require shared Memory. Okay to remove wasm-ld --shared-memory --no-check-features"),this.malloc=e=>new Promise(t=>{let r=this.exports.twr_malloc;t(r(e))}),this.init()}catch(e){throw console.log("WASM instantiate error: "+e+(e.stack?"\n"+e.stack:"")),e}}init(){let e;switch(this.modParams.stdio){case"debug":default:e=0;break;case"div":e=1;break;case"canvas":e=2;break;case"null":e=3}(0,this.exports.twr_wasm_init)(e,this.mem8.length)}async callC(e){let t=await this.preCallC(e),r=this.callCImpl(e[0],t);return this.postCallC(t,e),r}async callCImpl(e,t=[]){if(!this.exports)throw Error("this.exports undefined");if(!this.exports[e])throw Error("callC: function '"+e+"' not in export table.  Use --export wasm-ld flag.");return(0,this.exports[e])(...t)}async preCallC(e){if(e.constructor!==Array)throw Error("callC: params must be array, first arg is function name");if(0==e.length)throw Error("callC: missing function name");let t=[],r=0;for(let i=1;i<e.length;i++){let s=e[i];switch(typeof s){case"number":t[r++]=s;break;case"string":t[r++]=await this.putString(s);break;case"object":if(s instanceof URL){let e=await this.fetchAndPutURL(s);t[r++]=e[0],t[r++]=e[1];break}if(s instanceof ArrayBuffer){let e=await this.putArrayBuffer(s);t[r++]=e;break}default:throw Error("callC: invalid object type passed in")}}return t}async postCallC(e,t){let r=0;for(let i=1;i<t.length;i++){let s=t[i];switch(typeof s){case"number":r++;break;case"string":this.callCImpl("twr_free",[e[r]]),r++;break;case"object":if(s instanceof URL){this.callCImpl("twr_free",[e[r]]),r+=2;break}if(s instanceof ArrayBuffer){let t=new Uint8Array(s);for(let i=0;i<t.length;i++)t[i]=this.mem8[e[r]+i];this.callCImpl("twr_free",[e[r]]),r++;break}throw Error("postCallC: internal error A");default:throw Error("postCallC: internal error B")}}return e}copyString(e,t,r){let i;for(i=0;i<r.length&&i<t-1;i++)this.mem8[e+i]=r.charCodeAt(i);this.mem8[e+i]=0}async putString(e){let t=await this.malloc(e.length);return this.copyString(t,e.length,e),t}async putU8(e){let t=await this.malloc(e.length);for(let r=0;r<e.length;r++)this.mem8[t+r]=e[r];return t}async putArrayBuffer(e){let t=new Uint8Array(e);return this.putU8(t)}async fetchAndPutURL(e){if(!("object"==typeof e&&e instanceof URL))throw Error("fetchAndPutURL param must be URL");try{let t=await fetch(e),r=await t.arrayBuffer(),i=new Uint8Array(r);return[await this.putU8(i),i.length]}catch(t){throw console.log("fetchAndPutURL Error. URL: "+e+"\n"+t+(t.stack?"\n"+t.stack:"")),t}}getLong(e){let t=Math.floor(e/4);if(4*t!=e)throw Error("getLong passed non long aligned address");if(t<0||t>=this.mem32.length)throw Error("invalid index passed to getLong: "+e+", this.mem32.length: "+this.mem32.length);return this.mem32[t]}setLong(e,t){let r=Math.floor(e/4);if(4*r!=e)throw Error("setLong passed non long aligned address");if(r<0||r>=this.mem32.length)throw Error("invalid index passed to setLong: "+e+", this.mem32.length: "+this.mem32.length);this.mem32[r]=t}getDouble(e){let t=Math.floor(e/8);if(8*t!=e)throw Error("getLong passed non Float64 aligned address");return this.memD[t]}setDouble(e,t){let r=Math.floor(e/8);if(8*r!=e)throw Error("setDouble passed non Float64 aligned address");this.memD[r]=t}getShort(e){if(e<0||e>=this.mem8.length)throw Error("invalid index passed to getShort: "+e);return this.mem8[e]+256*this.mem8[e+1]}getString(e,t){let r="",i=0;for(;this.mem8[e+i]&&(void 0===t||i<t)&&e+i<this.mem8.length;)r+=String.fromCharCode(this.mem8[e+i]),i++;return r}getU8Arr(e){if(e<0||e>=this.mem8.length)throw Error("invalid index passed to getU8: "+e);let t=new Uint32Array(this.mem8.slice(e,e+8).buffer),r=t[0],i=t[1];if(i<0||i>=this.mem8.length)throw Error("invalid idx.dataptr passed to getU8");if(r<0||r>this.mem8.length-i)throw Error("invalid idx.size passed to  getU8");return this.mem8.slice(i,i+r)}getU32Arr(e){if(e<0||e>=this.mem8.length)throw Error("invalid index passed to getU32: "+e);let t=new Uint32Array(this.mem8.slice(e,e+8).buffer),r=t[0],i=t[1];if(i<0||i>=this.mem8.length)throw Error("invalid idx.dataptr passed to getU32");if(r<0||r>this.mem8.length-i)throw Error("invalid idx.size passed to  getU32");if(r%4!=0)throw Error("idx.size is not an integer number of 32 bit words");return new Uint32Array(this.mem8.slice(i,i+r).buffer)}}}),o("2Xdsi",function(t,r){e(t.exports,"twrFloatUtil",()=>i);class i{mod;constructor(e){this.mod=e}atod(e){let t=this.mod.getString(e),r=t.trimStart().toUpperCase();return"INF"==r||"+INF"==r?Number.POSITIVE_INFINITY:"-INF"==r?Number.NEGATIVE_INFINITY:Number.parseFloat(t.replaceAll("D","e").replaceAll("d","e"))}dtoa(e,t,r,i){if(-1==i){let i=r.toString();this.mod.copyString(e,t,i)}else{let s=r.toString();s.length>i&&(s=r.toPrecision(i)),this.mod.copyString(e,t,s)}}toFixed(e,t,r,i){let s=r.toFixed(i);this.mod.copyString(e,t,s)}toExponential(e,t,r,i){let s=r.toExponential(i);this.mod.copyString(e,t,s)}fcvtS(e,t,r,i,s,o){let n,a;if(0==e||0==o||0==s||t<1)return 1;let l=0;if(Number.isNaN(r))n="1#QNAN00000000000000000000000000000".slice(0,i+1),a=1;else if(Number.isFinite(r)){if(0==r)n="000000000000000000000000000000000000".slice(0,i),a=0;else{if(r<0&&(l=1,r=Math.abs(r)),i>100||r>1e21||r<1e-99)return this.mod.copyString(e,t,""),this.mod.mem32[s]=0,1;let[o="",h=""]=r.toFixed(i).split(".");"0"==o&&(o=""),o.length>0?(a=o.length,n=o+h):a=(n=h.replace(/^0+/,"")).length-h.length}}else n="1#INF00000000000000000000000000000".slice(0,i+1),a=1;return t-1<n.length?1:(this.mod.copyString(e,t,n),this.mod.setLong(s,a),this.mod.setLong(o,l),0)}}}),o("5LsZ0",function(t,r){e(t.exports,"twrCanvas",()=>l);var i,o,n=s("ghrAp"),a=s("47Wdp");(i=o||(o={}))[i.D2D_FILLRECT=1]="D2D_FILLRECT",i[i.D2D_FILLCHAR=5]="D2D_FILLCHAR",i[i.D2D_SETLINEWIDTH=10]="D2D_SETLINEWIDTH",i[i.D2D_SETFILLSTYLERGBA=11]="D2D_SETFILLSTYLERGBA",i[i.D2D_SETFONT=12]="D2D_SETFONT",i[i.D2D_BEGINPATH=13]="D2D_BEGINPATH",i[i.D2D_MOVETO=14]="D2D_MOVETO",i[i.D2D_LINETO=15]="D2D_LINETO",i[i.D2D_FILL=16]="D2D_FILL",i[i.D2D_STROKE=17]="D2D_STROKE",i[i.D2D_SETSTROKESTYLERGBA=18]="D2D_SETSTROKESTYLERGBA",i[i.D2D_ARC=19]="D2D_ARC",i[i.D2D_STROKERECT=20]="D2D_STROKERECT",i[i.D2D_FILLTEXT=21]="D2D_FILLTEXT",i[i.D2D_IMAGEDATA=22]="D2D_IMAGEDATA",i[i.D2D_PUTIMAGEDATA=23]="D2D_PUTIMAGEDATA",i[i.D2D_BEZIERTO=24]="D2D_BEZIERTO",i[i.D2D_MEASURETEXT=25]="D2D_MEASURETEXT",i[i.D2D_SAVE=26]="D2D_SAVE",i[i.D2D_RESTORE=27]="D2D_RESTORE",i[i.D2D_CREATERADIALGRADIENT=28]="D2D_CREATERADIALGRADIENT",i[i.D2D_SETCOLORSTOP=29]="D2D_SETCOLORSTOP",i[i.D2D_SETFILLSTYLEGRADIENT=30]="D2D_SETFILLSTYLEGRADIENT",i[i.D2D_RELEASEID=31]="D2D_RELEASEID",i[i.D2D_CREATELINEARGRADIENT=32]="D2D_CREATELINEARGRADIENT",i[i.D2D_SETFILLSTYLE=33]="D2D_SETFILLSTYLE",i[i.D2D_SETSTROKESTYLE=34]="D2D_SETSTROKESTYLE";class l{ctx;props={charWidth:0,charHeight:0,foreColor:0,backColor:0,widthInChars:0,heightInChars:0,canvasHeight:0,canvasWidth:0};owner;cmdCompleteSignal;canvasKeys;precomputedObjects;constructor(e,t,r){let{forecolor:i,backcolor:s,fontsize:o,isd2dcanvas:l}=t;if(this.owner=r,this.props.widthInChars=t.windim[0],this.props.heightInChars=t.windim[1],this.owner.isWasmModule||(this.cmdCompleteSignal=new a.twrSignal,this.canvasKeys=new n.twrSharedCircularBuffer),this.precomputedObjects={},e){if(!e.getContext)throw Error("attempted to create new twrCanvas with an element that is not a valid HTMLCanvasElement");let t=e.getContext("2d");if(!t)throw Error("canvas 2D context not found in twrCanvasConstructor");t.font=o.toString()+"px Courier New",t.textBaseline="top";let r="          ",n=t.measureText(r);this.props.charWidth=Math.ceil(n.width/r.length);let a=t.measureText("X");this.props.charHeight=Math.ceil(a.fontBoundingBoxAscent+a.fontBoundingBoxDescent),l||(e.width=this.props.charWidth*this.props.widthInChars,e.height=this.props.charHeight*this.props.heightInChars),this.props.canvasHeight=e.height,this.props.canvasWidth=e.width;let h=e.getContext("2d");if(!h)throw Error("canvas 2D context not found in twrCanvas.constructor (2nd time)");this.ctx=h,this.ctx.font=o.toString()+"px Courier New",this.ctx.textBaseline="top",h.fillStyle=s,this.props.backColor=Number("0x"+h.fillStyle.slice(1)),h.fillStyle=i,this.props.foreColor=Number("0x"+h.fillStyle.slice(1))}}isValid(){return!!this.ctx}getProxyParams(){if(!this.cmdCompleteSignal||!this.canvasKeys)throw Error("internal error in getProxyParams.");return[this.props,this.cmdCompleteSignal.sharedArray,this.canvasKeys.sharedArray]}getProp(e){this.isValid()||console.log("internal error - getProp called on invalid twrCanvas");let t=this.owner.getString(e);return this.props[t]}drawSeq(e){let t;if(this.isValid()||console.log("internal error - drawSeq called on invalid twrCanvas"),!this.ctx)return;let r=this.owner.getLong(e),i=this.owner.getLong(e+4);for(;;){let e=this.owner.getLong(r+4);switch(e){case o.D2D_FILLRECT:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getDouble(r+24),s=this.owner.getDouble(r+32);this.ctx.fillRect(e,t,i,s)}break;case o.D2D_STROKERECT:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getDouble(r+24),s=this.owner.getDouble(r+32);this.ctx.strokeRect(e,t,i,s)}break;case o.D2D_FILLCHAR:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=String.fromCharCode(this.owner.getShort(r+24));this.ctx.fillText(i,e,t)}break;case o.D2D_FILLTEXT:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getString(this.owner.getLong(r+24));this.ctx.fillText(i,e,t)}break;case o.D2D_MEASURETEXT:{let e=this.owner.getString(this.owner.getLong(r+8)),t=this.owner.getLong(r+12),i=this.ctx.measureText(e);this.owner.setDouble(t+0,i.actualBoundingBoxAscent),this.owner.setDouble(t+8,i.actualBoundingBoxDescent),this.owner.setDouble(t+16,i.actualBoundingBoxLeft),this.owner.setDouble(t+24,i.actualBoundingBoxRight),this.owner.setDouble(t+32,i.fontBoundingBoxAscent),this.owner.setDouble(t+40,i.fontBoundingBoxDescent),this.owner.setDouble(t+48,i.width)}break;case o.D2D_SETFONT:{let e=this.owner.getString(this.owner.getLong(r+8));this.ctx.font=e}break;case o.D2D_SETFILLSTYLERGBA:{let e="#"+("00000000"+this.owner.getLong(r+8).toString(16)).slice(-8);this.ctx.fillStyle=e}break;case o.D2D_SETSTROKESTYLERGBA:{let e="#"+("00000000"+this.owner.getLong(r+8).toString(16)).slice(-8);this.ctx.strokeStyle=e}break;case o.D2D_SETFILLSTYLE:{let e=this.owner.getString(this.owner.getLong(r+8));this.ctx.fillStyle=e}break;case o.D2D_SETSTROKESTYLE:{let e=this.owner.getString(this.owner.getLong(r+8));this.ctx.strokeStyle=e}break;case o.D2D_SETLINEWIDTH:{let e=this.owner.getShort(r+8);this.ctx.lineWidth=e}break;case o.D2D_MOVETO:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16);this.ctx.moveTo(e,t)}break;case o.D2D_LINETO:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16);this.ctx.lineTo(e,t)}break;case o.D2D_BEZIERTO:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getDouble(r+24),s=this.owner.getDouble(r+32),o=this.owner.getDouble(r+40),n=this.owner.getDouble(r+48);this.ctx.bezierCurveTo(e,t,i,s,o,n)}break;case o.D2D_BEGINPATH:this.ctx.beginPath();break;case o.D2D_FILL:this.ctx.fill();break;case o.D2D_SAVE:this.ctx.save();break;case o.D2D_RESTORE:this.ctx.restore();break;case o.D2D_STROKE:this.ctx.stroke();break;case o.D2D_ARC:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getDouble(r+24),s=this.owner.getDouble(r+32),o=this.owner.getDouble(r+40),n=0!=this.owner.getLong(r+48);this.ctx.arc(e,t,i,s,o,n)}break;case o.D2D_IMAGEDATA:{let e=this.owner.getLong(r+8),t=this.owner.getLong(r+12),i=this.owner.getLong(r+16),s=this.owner.getLong(r+20),o=this.owner.getLong(r+24);if(o in this.precomputedObjects&&console.log("warning: D2D_IMAGEDATA ID already exists."),this.owner.isWasmModule){let r=new Uint8ClampedArray(this.owner.memory.buffer,e,t);this.precomputedObjects[o]=new ImageData(r,i,s)}else this.precomputedObjects[o]={mem8:new Uint8Array(this.owner.memory.buffer,e,t),width:i,height:s}}break;case o.D2D_CREATERADIALGRADIENT:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getDouble(r+24),s=this.owner.getDouble(r+32),o=this.owner.getDouble(r+40),n=this.owner.getDouble(r+48),a=this.owner.getLong(r+56),l=this.ctx.createRadialGradient(e,t,i,s,o,n);a in this.precomputedObjects&&console.log("warning: D2D_CREATERADIALGRADIENT ID already exists."),this.precomputedObjects[a]=l}break;case o.D2D_CREATELINEARGRADIENT:{let e=this.owner.getDouble(r+8),t=this.owner.getDouble(r+16),i=this.owner.getDouble(r+24),s=this.owner.getDouble(r+32),o=this.owner.getLong(r+40),n=this.ctx.createLinearGradient(e,t,i,s);o in this.precomputedObjects&&console.log("warning: D2D_CREATELINEARGRADIENT ID already exists."),this.precomputedObjects[o]=n}break;case o.D2D_SETCOLORSTOP:{let e=this.owner.getLong(r+8),t=this.owner.getLong(r+12),i=this.owner.getString(this.owner.getLong(r+16));if(!(e in this.precomputedObjects))throw Error("D2D_SETCOLORSTOP with invalid ID: "+e);this.precomputedObjects[e].addColorStop(t,i)}break;case o.D2D_SETFILLSTYLEGRADIENT:{let e=this.owner.getLong(r+8);if(!(e in this.precomputedObjects))throw Error("D2D_SETFILLSTYLEGRADIENT with invalid ID: "+e);let t=this.precomputedObjects[e];this.ctx.fillStyle=t}break;case o.D2D_RELEASEID:{let e=this.owner.getLong(r+8);this.precomputedObjects[e]?delete this.precomputedObjects[e]:console.log("warning: D2D_RELEASEID with undefined ID ",e)}break;case o.D2D_PUTIMAGEDATA:{let e;let t=this.owner.getLong(r+8),i=this.owner.getLong(r+12),s=this.owner.getLong(r+16),o=this.owner.getLong(r+20),n=this.owner.getLong(r+24),a=this.owner.getLong(r+28),l=this.owner.getLong(r+32);if(!(t in this.precomputedObjects))throw Error("D2D_PUTIMAGEDATA with invalid ID: "+t);if(this.owner.isWasmModule)e=this.precomputedObjects[t];else{let r=this.precomputedObjects[t];e=new ImageData(Uint8ClampedArray.from(r.mem8),r.width,r.height)}0==a&&0==l?this.ctx.putImageData(e,i,s):this.ctx.putImageData(e,i,s,o,n,a,l)}break;default:throw Error("unimplemented or unknown Sequence Type in drawSeq: "+e)}if(0==(t=this.owner.getLong(r))){if(r!=i)throw Error("assert type error in twrcanvas, ins!=lastins");break}r=t}this.cmdCompleteSignal&&this.cmdCompleteSignal.signal()}}}),o("47Wdp",function(t,r){var i,s;e(t.exports,"twrSignal",()=>o),(s=i||(i={}))[s.WAITING=0]="WAITING",s[s.SIGNALED=1]="SIGNALED";class o{sharedArray;buf;constructor(e){if("undefined"!=typeof window&&!crossOriginIsolated&&"file:"!==window.location.protocol)throw Error("twrSignal constructor, crossOriginIsolated="+crossOriginIsolated+". See SharedArrayBuffer docs.");e?this.sharedArray=e:this.sharedArray=new SharedArrayBuffer(4),this.buf=new Int32Array(this.sharedArray),this.buf[0]=i.WAITING}signal(){this.buf[0]=i.SIGNALED,Atomics.notify(this.buf,0)}wait(){this.buf[0]==i.WAITING&&Atomics.wait(this.buf,0,i.WAITING)}isSignaled(){return this.buf[0]==i.SIGNALED}reset(){this.buf[0]=i.WAITING}}}),o("lsUl2",function(t,r){e(t.exports,"twrTimeImpl",()=>i);function i(){return Date.now()}}),o("baOio",function(t,r){e(t.exports,"twrWasmModuleAsync",()=>l);var i=s("9FI45"),o=s("aGUWE"),n=s("2vKdq"),a=s("bqeaG");class l extends o.twrWasmModuleInJSMain{myWorker;malloc;loadWasmResolve;loadWasmReject;callCResolve;callCReject;initLW=!1;waitingcalls;constructor(e){if(super(e),this.malloc=e=>{throw Error("Error - un-init malloc called.")},!window.Worker)throw Error("This browser doesn't support web workers.");this.myWorker=new Worker(s("aRHnW")),this.myWorker.onmessage=this.processMsg.bind(this)}async loadWasm(e){if(this.initLW)throw Error("twrWasmAsyncModule::loadWasm can only be called once per twrWasmAsyncModule instance");return this.initLW=!0,new Promise((t,r)=>{let i;this.loadWasmResolve=t,this.loadWasmReject=r,this.malloc=e=>this.callCImpl("twr_malloc",[e]),this.waitingcalls=new n.twrWaitingCalls,i=this.d2dcanvas.isValid()?this.d2dcanvas:this.iocanvas;let s={divProxyParams:this.iodiv.getProxyParams(),canvasProxyParams:i.getProxyParams(),waitingCallsProxyParams:this.waitingcalls.getProxyParams()},o={urlToLoad:new URL(e,document.URL).href,modWorkerParams:s,modParams:this.modParams};this.myWorker.postMessage(["startup",o])})}async callC(e){let t=await this.preCallC(e);return this.callCImpl(e[0],t)}async callCImpl(e,t=[]){return new Promise((r,i)=>{this.callCResolve=r,this.callCReject=i,this.myWorker.postMessage(["callC",e,t])})}keyDownDiv(e){if(!this.iodiv||!this.iodiv.divKeys)throw Error("unexpected undefined twrWasmAsyncModule.divKeys");this.iodiv.divKeys.write((0,a.default)(e).char.charCodeAt(0))}keyDownCanvas(e){if(!this.iocanvas||!this.iocanvas.canvasKeys)throw Error("unexpected undefined twrWasmAsyncModule.canvasKeys");this.iocanvas.canvasKeys.write((0,a.default)(e).char.charCodeAt(0))}processMsg(e){let t=e.data[0],r=e.data[1];switch(t){case"divout":this.iodiv.isValid()?this.iodiv.charOut(r):console.log("error - msg divout received but iodiv is undefined.");break;case"debug":(0,i.twrDebugLogImpl)(r);break;case"drawseq":{let[e]=r;if(this.iocanvas.isValid())this.iocanvas.drawSeq(e);else if(this.d2dcanvas.isValid())this.d2dcanvas.drawSeq(e);else throw Error("msg drawseq received but canvas is undefined.");break}case"setmemory":if(this.memory=r,!this.memory)throw Error("unexpected error - undefined memory in startupOkay msg");this.mem8=new Uint8Array(this.memory.buffer),this.mem32=new Uint32Array(this.memory.buffer),this.memD=new Float64Array(this.memory.buffer);break;case"startupFail":if(this.loadWasmReject)this.loadWasmReject(r);else throw Error("twrWasmAsyncModule.processMsg unexpected error (undefined loadWasmReject)");break;case"startupOkay":if(this.loadWasmResolve)this.loadWasmResolve(void 0);else throw Error("twrWasmAsyncModule.processMsg unexpected error (undefined loadWasmResolve)");break;case"callCFail":if(this.callCReject)this.callCReject(r);else throw Error("twrWasmAsyncModule.processMsg unexpected error (undefined callCReject)");break;case"callCOkay":if(this.callCResolve)this.callCResolve(r);else throw Error("twrWasmAsyncModule.processMsg unexpected error (undefined callCResolve)");break;default:if(!this.waitingcalls)throw Error("internal error: this.waitingcalls undefined.");if(!this.waitingcalls.processMessage(t,r))throw Error("twrWasmAsyncModule - unknown and unexpected msgType: "+t)}}}}),o("2vKdq",function(t,r){e(t.exports,"twrWaitingCalls",()=>n);var i=s("47Wdp"),o=s("lsUl2");class n{callCompleteSignal;parameters;constructor(){this.callCompleteSignal=new i.twrSignal,this.parameters=new Uint32Array(new SharedArrayBuffer(4))}startSleep(e){setTimeout(()=>{this.callCompleteSignal.signal()},e)}time(){let e=(0,o.twrTimeImpl)();this.parameters[0]=e,this.callCompleteSignal.signal()}getProxyParams(){return[this.callCompleteSignal.sharedArray,this.parameters.buffer]}processMessage(e,t){switch(e){case"sleep":let[r]=t;this.startSleep(r);break;case"time":this.time();break;default:return!1}return!0}}}),o("bqeaG",function(t,r){e(t.exports,"default",()=>m);let i={a:"selectAll",c:"copy",s:"save",v:"paste",x:"cut",y:"redo",z:"undo"},s={"/":"?",".":">",",":"<","'":'"',";":":","[":"{","]":"}","\\":"|","`":"~","=":"+","-":"_",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")",a:"A",b:"B",c:"C",d:"D",e:"E",f:"F",g:"G",h:"H",i:"I",j:"J",k:"K",l:"L",m:"M",n:"N",o:"O",p:"P",q:"q",r:"R",s:"S",t:"T",u:"U",v:"V",w:"W",x:"X",y:"Y",z:"Z"},o={};for(let e in s)o[s[e]]=e;let n={0:"\\",8:"backspace",9:"tab",12:"num",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"caps",27:"esc",32:" ",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",44:"print",45:"insert",46:"delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",61:"=",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",91:"meta",92:"meta",93:"meta",96:"num0",97:"num1",98:"num2",99:"num3",100:"num4",101:"num5",102:"num6",103:"num7",104:"num8",105:"num9",106:"*",107:"+",108:"num_enter",109:"num_subtract",110:"num_decimal",111:"num_divide",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",124:"print",144:"num",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",223:"`",224:"cmd",225:"alt",57392:"ctrl",63289:"num"},a={"\r":"enter"},l=JSON.parse(JSON.stringify(n));for(let e of Object.keys(a))l[e]=a[e];let h={num_subtract:"-",num_enter:"\n",num_decimal:".",num_divide:"/",enter:"\n",tab:"	",backspace:"\b"},c=["keydown","keyup"],d=()=>{let e=navigator.userAgent;return 0!==(/IEMobile|Windows Phone|Lumia/i.test(e)?"w":/iPhone|iP[oa]d/.test(e)?"i":/Android/.test(e)?"a":/BlackBerry|PlayBook|BB10/.test(e)?"b":/Mobile Safari/.test(e)?"s":/webOS|Mobile|Tablet|Opera Mini|\bCrMo\/|Opera Mobi/i.test(e)?1:0)};function u(e){let t=String.fromCharCode(e);return d()?t:t in o?o[t]:t in l?l[t]:t}function m(e){let t;if("keypress"!==e.type||d()){if("keypress"===e.type&&d())t=u(e.keyCode);else{if(!(c.indexOf(e.type)>-1))return!1;t=void 0!==e.which?n[e.which]:void 0!==e.keyCode?n[e.keyCode]:"enter"}}else t=u(e.charCode);let r=t;return e.shiftKey&&t in s?r=s[t]:e.ctrlKey&&t in i?r=i[t]:t in h&&(r=h[t]),{char:r,key:t}}}),o("aRHnW",function(e,t){var r=s("hoqmg");let i=new URL("twrmodworker.2165e649.js",import.meta.url);e.exports=r(i.toString(),i.origin,!0)}),o("hoqmg",function(e,t){e.exports=function(e,t,r){if(t===self.location.origin)return e;var i=r?"import "+JSON.stringify(e)+";":"importScripts("+JSON.stringify(e)+");";return URL.createObjectURL(new Blob([i],{type:"application/javascript"}))}}),s("eZoLj").register(new URL("",import.meta.url).toString(),JSON.parse('["kjr0c","index.528b9ee5.js","cTHdP","twrmodworker.2165e649.js"]'));
//# sourceMappingURL=index.528b9ee5.js.map
