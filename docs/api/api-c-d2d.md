---
title: 2D Drawing API for WebAssembly
description: twr-wasm provides a 2D drawing C API that allows Wasm code to call many JavaScript Canvas APIs.
---

# 2D Draw C API for WebAssembly

This section describes twr-wasm's C D2D API, which allows your WebAssembly module to call many of the JavaScript Canvas APIs.  

## Examples
| Name | View Live Link | Source Link |
| --------- | ------------ | ----------- |
| Bouncing Balls (C++) | [View bouncing balls](/examples/dist/balls/index.html) | [Source for balls](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/balls) |
| Pong (C++) | [View Pong](/examples/dist/pong/index.html) | [Source for Pong](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/pong) | 
| Maze (Win32 C Port) | [View live maze here](/examples/dist/maze/index.html) | [Source for maze](https://github.com/twiddlingbits/twr-wasm/tree/main/examples/maze) |


## Code Example
~~~c title="Draw A Rectangle"
#include "twr-draw2d.h"

void square() {
   // batch draw commands, with a maximum of 100 commands before render
   struct d2d_draw_seq* ds=d2d_start_draw_sequence(100);
   // set color using CSS color string
   d2d_setfillstyle(ds, "blue");
   // draw a the rect
   d2d_fillrect(ds, 10, 10, 100, 100);
   // this will cause the JavaScript thread to render
   d2d_end_draw_sequence(ds);
}
~~~

## Overview
The Draw 2D APIs are C APIs and are part of the twr-wasm library that you access with `#include "twr-draw2d.h"`.  There is also a C++ canvas wrapper class in `examples/twr-cpp` used by the balls and pong examples.

To create a canvas surface, that you can draw to using the twr-wasm 2D C drawing APIs, you can use the `twrConsoleCanvas` class in your JavaScript/HTML ([see Consoles Section](../gettingstarted/stdio.md)).  Or more simply, if you add a canvas tag to your HTML named `twr_d2dcanvas`, the needed `twrConsoleCanvas` will be created automatically.

~~~js
<canvas id="twr_d2dcanvas" width="600" height="600"></canvas>
//Feel free to change the `width="600` and/or `height="600` attributes.
~~~

To draw using the C 2D Draw API:

   - call `d2d_start_draw_sequence`  (or alternately `d2d_start_draw_sequence_with_con`)
   - call one or more (a sequence) of 2D draw commands, like `d2d_fillrect`
   - call `d2d_end_draw_sequence`
   - repeat as desired

`d2d_start_draw_sequence` will draw to the default `twrConsoleCanvas`, as explained at the start of this section.  `d2d_start_draw_sequence_with_con` is optional, and allows you to specify the `twrConsoleCanvas` to draw to.  You would typically get this console in C using the `twr_get_console` function ([which retrieves a named console](../api/api-typescript.md#io-option-multiple-consoles-with-names) that you specified in the `io` module option.)

 Commands are queued until flushed -- which will take the batch of queued draw commands, and execute them.  The 2D draw APIs will work with either `twrWasmModule` or `twrWasmModuleAsync`.   With `twrWasmModuleAsync`, the batch of commands is sent from the worker thread over to the JavaScript main thread for execution. By batching the calls between calls to `d2d_start_draw_sequence` and `d2d_end_draw_sequence`, performance is improved.

 `d2d_flush` waits for the commands to finish execution before returning.  `d2d_flush` is called automatically by `d2d_end_draw_sequence` and so you generally don't need to call it manually.

You pass an argument to `d2d_start_draw_sequence` specifying how many instructions will trigger an automatic call to `d2d_flush`.  You can make this larger for efficiency, or smaller if you want to see the render progress more frequently.  There is no limit on the size of the queue, except memory used in the Wasm module.  The `d2d_flush` function can be called manually, but this is not normally needed, unless you would like to ensure a sequence renders before your `d2d_end_draw_sequence` is called, or before the count passed `d2d_start_draw_sequence` is met.

If you are using `twrWasmModuleAsync`, or if you are re-rendering the entire frame for each animation update, you should ensure that all of your draws for a complete frame are made without an explicit or implicit call to `d2d_flush` in the middle of the draw sequence, as this may cause flashing.

## Possible Pitfalls
Some commands have extra details that you need to be aware of to avoid performance loss or bugs.

* Getters, like d2d_measuretext, will flush the queue in order to retrieve the requested data. If your program relies on not flushing early (for example, to avoid flashes), then getters should be avoided in your main render loops.
* putImageData references the provided pointer, so the given image data needs to stay on the caller's stack or heap until flush is called, so it doesn't get overwritten.
* getLineDash takes in a buffer_length, double * array (the buffer), and returns the amount of the buffer filled. If there are more line segments than can fit in the buffer_length, a warning is printed and the excess is voided. If you want to know the size before hand for allocation, the getLineDashLength function is available.

## Extra Notes
The functions listed below are based on the JavaScript Canvas 2D API ([found here](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)). However, there are some slight differences since it is made for C rather than JavaScript.  For example some items keep resources stored on the JavaScript side (such as d2d_createlineargradient) which are referenced by an ID rather than the objects themselves.

Additionally, there are alternative functions like d2d_setstrokestylergba,  which calls the same underlying function as d2d_setstrokestyle, but takes in a color as a number rather than CSS style string.

As noted above, putImageData requires that the image data be alive until flush is called, however, other functions like d2d_filltext don't have this same issue because they copy the string on to the heap. This allows it to be cleaned up with flush() and ensures that it stays alive long enough to be transferred to typescript.

## Functions
These are the Canvas APIs currently available in C:

~~~
struct d2d_draw_seq* d2d_start_draw_sequence(int flush_at_ins_count);
struct d2d_draw_seq* d2d_start_draw_sequence_with_con(int flush_at_ins_count, struct IoConsole * con);
void d2d_end_draw_sequence(struct d2d_draw_seq* ds);
void d2d_flush(struct d2d_draw_seq* ds);
int d2d_get_canvas_prop(const char* prop);
struct IoConsole * twr_get_std2d_con();

void d2d_fillrect(struct d2d_draw_seq* ds, double x, double y, double w, double h);
void d2d_strokerect(struct d2d_draw_seq* ds, double x, double y, double w, double h);
void d2d_filltext(struct d2d_draw_seq* ds, const char* str, double x, double y);
void d2d_fillcodepoint(struct d2d_draw_seq* ds, unsigned long c, double x, double y);
void d2d_stroketext(struct d2d_draw_seq* ds, const char* text, double x, double y);

void d2d_measuretext(struct d2d_draw_seq* ds, const char* str, struct d2d_text_metrics *tm);
void d2d_save(struct d2d_draw_seq* ds);
void d2d_restore(struct d2d_draw_seq* ds);

void d2d_setlinewidth(struct d2d_draw_seq* ds, double width);
void d2d_setstrokestylergba(struct d2d_draw_seq* ds, unsigned long color);
void d2d_setfillstylergba(struct d2d_draw_seq* ds, unsigned long color);
void d2d_setstrokestyle(struct d2d_draw_seq* ds, const char* css_color);
void d2d_setfillstyle(struct d2d_draw_seq* ds, const char* css_color);
void d2d_setfont(struct d2d_draw_seq* ds, const char* font);

void d2d_createlineargradient(struct d2d_draw_seq* ds, long id, double x0, double y0, double x1, double y1);
void d2d_createradialgradient(struct d2d_draw_seq* ds, long id, double x0, double y0, double radius0, double x1, double y1, double radius1);
void d2d_addcolorstop(struct d2d_draw_seq* ds, long gradID, long position, const char* csscolor);
void d2d_setfillstylegradient(struct d2d_draw_seq* ds, long gradID);
void d2d_releaseid(struct d2d_draw_seq* ds, long id);

void d2d_beginpath(struct d2d_draw_seq* ds);
void d2d_fill(struct d2d_draw_seq* ds);
void d2d_stroke(struct d2d_draw_seq* ds);
void d2d_moveto(struct d2d_draw_seq* ds, double x, double y);
void d2d_lineto(struct d2d_draw_seq* ds, double x, double y);
void d2d_arc(struct d2d_draw_seq* ds, double x, double y, double radius, double start_angle, double end_angle, bool counterclockwise);
void d2d_arcto(struct d2d_draw_seq* ds, double x1, double y1, double x2, double y2, double radius);
void d2d_bezierto(struct d2d_draw_seq* ds, double cp1x, double cp1y, double cp2x, double cp2y, double x, double y);
void d2d_roundrect(struct d2d_draw_seq* ds, double x, double y, double width, double height, double radii);
void d2d_ellipse(struct d2d_draw_seq* ds, double x, double y, double radiusX, double radiusY, double rotation, double startAngle, double endAngle, bool counterclockwise);
void d2d_quadraticcurveto(struct d2d_draw_seq* ds, double cpx, double cpy, double x, double y);
void d2d_closepath(struct d2d_draw_seq* ds);

void d2d_imagedata(struct d2d_draw_seq* ds, long id, void*  mem, unsigned long length, unsigned long width, unsigned long height);
void d2d_putimagedata(struct d2d_draw_seq* ds, long id, unsigned long dx, unsigned long dy);
void d2d_putimagedatadirty(struct d2d_draw_seq* ds, long id, unsigned long dx, unsigned long dy, unsigned long dirtyX, unsigned long dirtyY, unsigned long dirtyWidth, unsigned long dirtyHeight);

void d2d_reset(struct d2d_draw_seq* ds);
void d2d_clearrect(struct d2d_draw_seq* ds, double x, double y, double w, double h);
void d2d_scale(struct d2d_draw_seq* ds, double x, double y);
void d2d_translate(struct d2d_draw_seq* ds, double x, double y);
void d2d_rotate(struct d2d_draw_seq* ds, double angle);
void d2d_gettransform(struct d2d_draw_seq* ds, struct d2d_2d_matrix *transform);
void d2d_settransform(struct d2d_draw_seq* ds, double a, double b, double c, double d, double e, double f);
void d2d_settransformmatrix(struct d2d_draw_seq* ds, const struct d2d_2d_matrix * transform);
void d2d_resettransform(struct d2d_draw_seq* ds);
void d2d_setlinedash(struct d2d_draw_seq* ds, unsigned long len, const double* segments);
unsigned long d2d_getlinedash(struct d2d_draw_seq* ds, unsigned long length, double* buffer);
unsigned long d2d_getlinedashlength(struct d2d_draw_seq* ds);
~~~

d2d_measuretext() returns this structure:

~~~
struct d2d_text_metrics {
    double actualBoundingBoxAscent;
    double actualBoundingBoxDescent;
    double actualBoundingBoxLeft;
    double actualBoundingBoxRight;
    double fontBoundingBoxAscent;
    double fontBoundingBoxDescent;
    double width;
};
~~~


d2d_get_canvas_prop() returns a value of:

~~~
export interface ICanvasProps {
   charWidth: number,
   charHeight: number,
   foreColor: number,
   backColor: number,
   widthInChars: number,
   heightInChars: number,
   canvasWidth:number,
   canvasHeight:number
}

~~~

d2d_gettransform() returns this structure:
~~~
struct d2d_2d_matrix {
   double a, b, c, d, e, f;
};
~~~

d2d_getlinedash() returns this structure:
~~~
struct d2d_line_segments {
    long len;
    double *segments;
};
~~~