# Easier C/C++ WebAssembly
**Version 2.4.1**

twr-wasm is a simple, lightweight and easy to use library for building C/C++ WebAssembly code directly with clang. It solves some common use cases with less work than the more feature rich emscripten. 

twr-wasm is easy to understand, and has some great features. You can call blocking functions. You can input and print streaming character i/o to a `<div>` tag, use a `<canvas>` element as an terminal, and use 2D drawing apis (that are compatible with JavaScript Canvas APIs) to draw to a `<canvas>` element. 

twr-wasm allows you to run C/C++ code in a web browser. Legacy code, libraries, full applications, or single functions can be integrated with JavaScript and TypeScript.

twr-wasm is designed to be used with the standard llvm clang compiler and tools.

## Live WebAssembly Examples and Source

| Name | View Live Link | Source Link |
| --------- | ------------ | ----------- |
| Bouncing Balls (C++) | [View bouncing balls](https://twiddlingbits.dev/examples/dist/balls/index.html) | [Source for balls](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/balls) |
| Maze Gen/Solve (Win32 C Port) | [View live maze](https://twiddlingbits.dev/examples/dist/maze/index.html) | [Source for maze](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/maze) |
| Input/Output with `<div>` | [View square demo](https://twiddlingbits.dev/examples/dist/stdio-div/index.html) | [Source](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/stdio-div) |
|Mini-Terminal (hello world using `<canvas>`)|[View demo](https://twiddlingbits.dev/examples/dist/stdio-canvas/index.html) |[Source](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/stdio-canvas) |
|CLI using libc++ and `<canvas>`)| [View console](https://twiddlingbits.dev/examples/dist/tests-user/index.html) | [Source](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/tests-user) |

## Full Documentation
The full documentation can be [found here](https://twiddlingbits.dev/docsite/)

## Key Features
   - compile and link C/C++ for use with WebAssembly using clang directly
   - standard C library, libc++. and purpose built APIs available from C/C++
   - TypeScrpt/JavaScript classes to load Wasm modules and call C/C++ functions
   - localization support, UTF-8, and windows-1252 support
   - in C/C++, print and get characters to/from `<div>` tags in your HTML page
   - in C/C++, print and get characters to/from a `<canvas>` based "terminal"
   - in C/C++ use 2D drawing API compatible with JavaScript Canvas
   - in C/C++, use the "blocking loop" pattern and integrate with Javascript's asynchronous event loop

## Installation
`npm install twr-wasm`. 

For details see https://twiddlingbits.dev/docsite/gettingstarted/installation/

## Hello World
Here is the simplest twr-wasm example.

C code:

~~~
#include <stdio.h>

void hello() {
   printf("hello world\n");
}
~~~

index.html:
~~~
<head>
   <title>Hello World</title>
</head>
<body>
   <div id="twr_iodiv"></div>

   <script type="module">
      import {twrWasmModule} from "twr-wasm";
      
      const mod = new twrWasmModule();
      await mod.loadWasm("./helloworld.wasm");
      await mod.callC(["hello"]);
   </script>
</body>
~~~



## Simple \<div> i/o
I/O can be directed to or from a \<div> or a \<canvas> tag.  Here is a simple example using a \<div> for stdio input and output.

 <br>

~~~
#include <stdio.h>
#include <stdlib.h>
#include "twr-crt.h"

void stdio_div() {
   char inbuf[64];
   char *r;
   int i;

   printf("Square Calculator\n");

   while (1) {
      printf("Enter an integer: ");
      r=twr_mbgets(inbuf);  // r is NULL if esc entered.  Otherwise r == inbuf
      if (r) {  
         i=atoi(inbuf);
         printf("%d squared is %d\n\n",i,i*i);
      }
      else {
         printf("\n");
      }
   }
}
~~~

With an index.html like the following.  This time we are using twrWasmModuleAsync which integrates blocking C code into Javascript.  twrWasmModuleAsync can also be used to receive key input from a \<div> or \<canvas> tag. 

~~~
<body>
   <div id="stdioDiv" 
        tabindex="0" 
        style="color: DarkGreen; background-color: LightGray; font-size: 18px;font-family: Arial, sans-serif;" >
        Loading... <br>
   </div>

   <script type="module">
      import {twrWasmModuleAsync, twrConsoleDiv} from "twr-wasm";

      const con = new twrConsoleDiv(document.getElementById("stdioDiv"));
      const amod = new twrWasmModuleAsync({stdio: con});

      // remove 'Loading...'
      document.getElementById("stdioDiv").innerHTML ="<br>"; 
      // send key events to twrConsoleDiv
      document.getElementById("stdioDiv").addEventListener("keydown",(ev)=>{con.keyDown(ev)});

      await amod.loadWasm("./stdio-div.wasm");
      await amod.callC(["stdio_div"]);

   </script>
</body>
~~~

## Full Documentation
The full documentation can be [found here](https://twiddlingbits.dev/)
