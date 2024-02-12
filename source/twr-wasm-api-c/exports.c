#include "twr-crt.h"
#include "twr-wasm.h"

/* WebAssembly.ModuleExports (C functions callable by javascript/typescript)  */
/* need to appear on --export arg to wasm-ld in makefile */

/* pf 0 - printf goes to web browser debug console */
/* pf 1 - printf goes to web browser DIV */
/* pf 2 - printf goes to web browser Canvas */
/* pf 3 - printf goes to null console (default if this call not made) */
/* width, height only used when pf is windowcon (Canvas) */

void twr_wasm_init(int pf, int width, int height) {
	struct IoConsole* con;

	switch (pf) {
		case 0:
			con=twr_wasm_get_debugcon();
			break;

		case 1:
			con=twr_wasm_get_divcon();
			break;

		case 2:
			con=twr_wasm_get_windowcon(width, height);
			break;

		case 3:
			con=twr_get_nullcon();
			break;

		default:
			con=twr_wasm_get_debugcon();
	}

	twr_set_stdio_con(con);
}