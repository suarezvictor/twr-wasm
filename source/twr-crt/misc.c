#include "twr-crt.h"

int twr_minint(int a, int b) {
	return a<b?a:b;
}

int twr_maxint(int a, int b) {
	return a>b?a:b;
}

int twr_misc_unit_test() {
	if (twr_minint(5, 100)!=5) return 0;
	if (twr_maxint(5, 100)!=100) return 0;

	return 1;
}

/**************************************************/

int twr_isnan(double v) {
	return __builtin_isnan(v);
}

int twr_isinf(double v) {
	return __builtin_isinf(v);
}

double twr_nanval() {
	return __builtin_nan("");
}

double twr_infval() {
	return __builtin_inf();
}

/**************************************************/

// for internal use, not an export
void nstrcopy(char *buffer, const int sizeInBytes, const char *outstring, const int sizeofoutstring, int n) {
	if (n>0) {
		if (n>sizeofoutstring) n = sizeofoutstring;
		if (n>sizeInBytes-1) n=sizeInBytes-1;
		twr_strncpy(buffer, outstring, n);
	}
	if (n>=0) buffer[n]=0;
	else if (sizeInBytes>0) buffer[0]=0;
}




