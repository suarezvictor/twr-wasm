
#include <stdio.h>
#include <stdlib.h>
#include "twr-crt.h"
#include "twr-ex.h"

// This example shows how to create a twrWasmLibrary
// A twrLibrary enables you to expose JavaScript code as C APIs
// There are two required files for a new Library:
// A TypeScript file that derives from twrLibrary
// A C .h file that provide C API signatures for the functions defined in twr

// This file is a test file that exercises the C APIs exposed by twrLibraryExample


// key event callback
__attribute__((export_name("on_key")))
void on_key(int event_id, int key_code) {
   printf("key code: %d\n", key_code);
}

// timer event callback (called once)
__attribute__((export_name("on_timer1")))
void on_timer1(int event_id) {
   printf("timer callback 1 entered (event id=%d) !\n", event_id);

   printf("press keys now\n");
   int key=twr_register_callback("on_key");

   ex_listen_key_events(key);
}

// timer event callback (called multiple times by different timers)
__attribute__((export_name("on_timer2")))
void on_timer2(int event_id) {
   printf("timer callback 2 entered (event id=%d)\n", event_id);
}

// entry point
__attribute__((export_name("twr_main")))
void twr_main(int is_async) {

   printf("welcome to the example library using %s\n",is_async?"twrWasmModuleAsync":"twrWasmModule");

   if (5.5!=return_a_float()) {printf("ERROR in return_a_float!\n"); return;}
   if (5.55!=return_a_double()) {printf("ERROR in return_a_double!\n"); return;}
   if (5!=return_a_int()) {printf("ERROR in return_a_int!\n"); return;}

   unsigned long ms=ex_get_epoch();
   printf ("ms since the epoch is %lu\n", ms);

   char* two_str=ex_append_two_strings("AAA-","BBB");
   printf ("two strings appended: %s\n", two_str);;
   free(two_str);

   if (is_async) {
      printf("going to sleep...");
      ex_sleep(1000);
      printf("awake!\n");
   }

   int timer1=twr_register_callback("on_timer1");

   // note these are all the same callback, but different id
   int timer2=twr_register_callback("on_timer2");
   int timer3=twr_register_callback("on_timer2");
   int timer4=twr_register_callback("on_timer2");

   ex_single_shot_timer(2000, timer1);
   ex_single_shot_timer(500, timer2);
   ex_single_shot_timer(1000, timer3);
   ex_single_shot_timer(1500, timer4);
}
