---
title: TypeScript-JavaScript API to load and call Wasm
description: twr-wasm provides TypeScript/JavaScript classes to load Wasm modules, and to call C functions.  Blocking or non-blocking code is supported.
---

# TypeScript-JavaScript API to load and call Wasm
This section describes the twr-wasm TypeScript/JavaScript classes that you use to load your Wasm modules, and to call C functions in your Wasm modules.

`class twrWasmModule` and `class twrWasmModuleAsync` have similar APIs.  The primary difference is that `class twrWasmModuleAsync` proxies functionality through a Web Worker thread, which allows blocking C functions to be called in your WebAssembly Module.   The `Async` part of `twrWasmModuleAsync` refers to the ability to `await` on a blocking `callC` in your JavaScript main thread, when using `twrWasmModuleAsync`.

## class twrWasmModule
~~~
import {twrWasmModule} from "twr-wasm";
  
const mod = new twrWasmModule();
~~~
`twrWasmModule` provides the two core JavaScript APIs for access to a WebAssembly Module: 

- `loadWasm` to load your `.wasm` module (your compiled C code).
- `callC` to call a C function

### loadWasm
Use `loadWasm` to load your compiled C/C++ code (the `.wasm` file). 
~~~
await mod.loadWasm("./mycode.wasm")
~~~

### callC
After your .`wasm` module is loaded with `loadWasm`, you call functions in your C/C++ from TypeScript/JavaScript like this:
~~~
let result=await mod.callC(["function_name", param1, param2])
~~~

If you are calling into C++, you need to use extern "C" like this in your C++ function:
~~~
extern "C" int function_name() {}
~~~

Each C/C++ function that you wish to call from TypeScript/JavaScript needs to be exported in your `wasm-ld` command line with an option like this:
~~~
--export=function_name
~~~
Or like this in your source file:
~~~
__attribute__((export_name("function_name")))
void function_name() {
   ...
}
~~~

Fo more details, see the [Compiler Options](../gettingstarted/compiler-opts.md).

`callC` takes an array where:

- the first entry is the name of the C function in the Wasm module to call 
- and the next optional entries are a variable number of arguments to pass to the C function, of type:
  
    - `number` - will be converted to a signed or unsigned `long`, `int32_t`, `int`, `float` or `double` as needed to match the C function declaration.
    - `bigint` - will be converted into an `int64_t` or equivalent
    - `string` - converted to a `char *` of malloc'd module memory where string is copied into
    - `ArrayBuffer` - the array is copied into malloc'd module memory.  If you need to pass the length, pass it as a separate argument.  Any modifications to the memory made by your C code will be reflected back into the JavaScript ArrayBuffer.
    - `URL` - the url contents are copied into malloc'd module Memory, and two C arguments are generated - index (pointer) to the memory, and length

`callC` returns the value returned by the C function. `long`, `int32_t`, `int`, `float` or `double` and the like are returned as a `number`,  `int64_t` is returned as a `bigint`, and pointers are returned as a `number`.  The contents of the pointer will need to be extracted using the functions listed below in the section "Accessing Data in the WebAssembly Memory".  The [callC example](../examples/examples-callc.md) also illustrates this. 

More details can be found in this article: [Passing Function Arguments to WebAssembly](../gettingstarted/parameters.md) and [in this example](../examples/examples-callc.md).  The [FFT example](../examples/examples-fft.md) demonstrates passing and modifying a `Float32Array` view of an `ArrayBuffer`.

## class twrWasmModuleAsync
~~~
import {twrWasmModuleAsync} from "twr-wasm";
  
const amod = new twrWasmModuleAsync();
~~~

`twrWasmModuleAsync` implements all of the same functions as `twrWasmModule`, plus allows blocking inputs, and blocking code generally. This is achieved by proxying all the calls through a Web Worker thread. 

For example, with this C function in your Wasm module:
~~~
void mysleep() {
	twr_sleep(5000);  // sleep 5 seconds
}
~~~

can be called from your JavaScript main loop like this:
~~~
await amod.callC(["mysleep"]);
~~~

This is useful for inputting from `stdin`, or for traditional blocking loops.  The example [stdio-div - Printf and Input Using a div Tag](../examples/examples-stdio-div.md) demos this.

You must use `twrWasmModuleAsync` in order to:

- call any blocking C function (meaning it takes "a long time") to return
- use blocking input from a div or canvas ( eg. `twr_mbgets` )
- use `twr_sleep`

See [stdio section](../gettingstarted/stdio.md) for information on enabling blocking character input, as well as this [Example](../examples/examples-stdio-div.md).

When linking your C/C++ code, `twrWasmModule` and `twrWasmModuleAsync` use slightly different `wasm-ld` options since `twrWasmModuleAsync` uses shared memory. `twrWasmModule` will operate with shared memory, so technically you could just use the same share memory options with either module,  but you don't need the overhead of shared memory when using twrWasmModule, and so better to not enable it.

See [Compiler Options](../gettingstarted/compiler-opts.md).

`twrWasmModuleAsync` uses SharedArrayBuffers which require certain HTTP headers to be set. Note that `twrWasmModule` has an advantage in that it does **not** use SharedArrayBuffers.

Github pages doesn't support the needed CORS headers for SharedArrayBuffers.  But other web serving sites do have options to enable the needed CORS headers.  For example, the azure static web site config file `staticwebapp.config.json` looks like this:
~~~json
{
    "globalHeaders": {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
}
~~~

[server.py](https://github.com/twiddlingbits/twr-wasm/blob/main/examples/server.py) in the examples folder will launch a local server with the correct headers.  To use Chrome without a web server, see the [Hello World walk through](../gettingstarted/helloworld.md).

## Class Options
The `twrWasmModule` and `twrWasmModuleAsync` constructor both take optional options.

For example:
~~~js
let amod=new twrWasmModuleAsync();

let amod=new twrWasmModuleAsync({
   windim:[50,20], 
   forecolor:"beige", 
   backcolor:"DarkOliveGreen", 
   fontsize:18
   });
~~~

For a `<div id="twr_iodiv">` it is simpler to set the color and font in the div tag per the normal HTML method.  But for `<div id="twr_iocanvas">`, that method won't work and you need to use the constructor options for color and fontsize.

These are the options:
~~~js
export type TStdioVals="div"|"canvas"|"null"|"debug";

export interface IModOpts {
   stdio?:TStdioVals, 
   windim?:[number, number],
   forecolor?:string,
   backcolor?:string,
   fontsize?:number,
   imports?:{},
}
~~~

### stdio
You can explicitly set your stdio source (for C/C++ printf, etc) with the stdio option, but typically you don't set it.  Instead, it will auto set as [described here](../gettingstarted/stdio.md)

### windim
This options is used with a terminal console ( `<canvas id="twr_iocanvas">` ) to set the width and height, in characters.

The canvas width and height, in pixels, will be set based on your fontsize and the width and height (in characters) of the terminal.

### forecolor and backcolor
These can be set to a CSS color (like '#FFFFFF' or 'white') to change the default background and foreground colors.

### fonsize
Changes the default fontsize for div or canvas based I/O. The size is in pixels.

## divLog
If [`stdio`](../gettingstarted/stdio.md) is set to `twr_iodiv`, you can use the `divLog` twrWasmModule/Async function like this:
~~~js
import {twrWasmModule} from "twr-wasm";

const mod = new twrWasmModule();
await mod.loadWasm("./tests.wasm");
await mod.callC(["tests"]);

mod.divLog("\nsin() speed test");
let sumA=0;
const start=Date.now();

for (let i=0; i<2000000;i++)
   sumA=sumA+Math.sin(i);

const endA=Date.now();

let sumB=await mod.callC(["sin_test"]);
const endB=Date.now();

mod.divLog("sum A: ", sumA, " in ms: ", endA-start);
mod.divLog("sum B: ", sumB,  " in ms: ", endB-endA);
~~~

## Accessing Data in the WebAssembly Memory
`callC()` will convert your JavaScript arguments into a form suitable for use by your C code.  However, if you return or want to access struct values inside TypeScript you will find the following `twrWasmModule` and `twrWasmModuleAsync` functions handy. See the [callc example](../examples/examples-callc.md) and [Passing Function Arguments from JavaScript to C/C++ with WebAssembly](../gettingstarted/parameters.md) for an explanation of how these functions work.
~~~js
async putString(sin:string, codePage=codePageUTF8)  // returns index into WebAssembly.Memory
async putU8(u8a:Uint8Array)   // returns index into WebAssembly.Memory
async putArrayBuffer(ab:ArrayBuffer)  // returns index into WebAssembly.Memory
async fetchAndPutURL(fnin:URL)  // returns index into WebAssembly.Memory
async malloc(size:number)           // returns index in WebAssembly.Memory.  

stringToU8(sin:string, codePage=codePageUTF8)
copyString(buffer:number, buffer_size:number, sin:string, codePage=codePageUTF8):void
getLong(idx:number): number
setLong(idx:number, value:number)
getDouble(idx:number): number
setDouble(idx:number, value:number)
getShort(idx:number): number
getString(strIndex:number, len?:number, codePage=codePageUTF8): string
getU8Arr(idx:number): Uint8Array
getU32Arr(idx:number): Uint32Array
      
memory?:WebAssembly.Memory;
mem8:Uint8Array;
mem32:Uint32Array;
memD:Float64Array;
~~~

