import { twrWasmModuleBase } from "./twrmodbase.js";
export declare const codePageASCII = 0;
export declare const codePage1252 = 1252;
export declare const codePageUTF8 = 65001;
export declare const codePageUTF32 = 12000;
export declare class twrCodePageToUnicodeCodePoint {
    decoderUTF8: TextDecoder;
    decoder1252: TextDecoder;
    convert(c: number, codePage: number): number;
}
export declare function twrUnicodeCodePointToCodePageImpl(this: twrWasmModuleBase, outstr: number, cp: number, codePage: number): number;
export declare function twrUserLanguageImpl(this: twrWasmModuleBase): number;
export declare function twrRegExpTest1252Impl(this: twrWasmModuleBase, regexpStrIdx: number, c: number): 0 | 1;
export declare function to1252(instr: string): number;
export declare function toASCII(instr: string): number;
export declare function twrToLower1252Impl(this: twrWasmModuleBase, c: number): number;
export declare function twrToUpper1252Impl(this: twrWasmModuleBase, c: number): number;
export declare function twrStrcollImpl(this: twrWasmModuleBase, lhs: number, rhs: number, codePage: number): number;
export declare function twrTimeTmLocalImpl(this: twrWasmModuleBase, tmIdx: number, epochSecs: number): void;
export declare function twrUserLconvImpl(this: twrWasmModuleBase, lconvIdx: number, codePage: number): void;
export declare function twrGetDtnamesImpl(this: twrWasmModuleBase, codePage: number): number;
//# sourceMappingURL=twrlocale.d.ts.map