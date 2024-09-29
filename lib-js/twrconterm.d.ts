import { twrCodePageToUnicodeCodePoint } from "./twrliblocale.js";
import { IConsoleTerminal, IConsoleTerminalProps, IConsoleTerminalParams } from "./twrcon.js";
import { IWasmModuleAsync } from "./twrmodasync.js";
import { IWasmModule } from "./twrmod.js";
import { twrLibrary, TLibImports } from "./twrlibrary.js";
export declare class twrConsoleTerminal extends twrLibrary implements IConsoleTerminal {
    id: number;
    element: HTMLElement;
    ctx: CanvasRenderingContext2D;
    props: IConsoleTerminalProps;
    size: number;
    cellWidth: number;
    cellHeight: number;
    cellW1: number;
    cellW2: number;
    cellH1: number;
    cellH2: number;
    cellH3: number;
    isCursorVisible: boolean;
    videoMem: number[];
    foreColorMem: number[];
    backColorMem: number[];
    cpTranslate: twrCodePageToUnicodeCodePoint;
    keyBuffer: KeyboardEvent[];
    keyWaiting?: (key: number) => void;
    imports: TLibImports;
    libSourcePath: string;
    interfaceName: string;
    constructor(canvasElement: HTMLCanvasElement, params?: IConsoleTerminalParams);
    getProp(propName: string): number;
    twrConGetProp(callingMod: IWasmModule | IWasmModuleAsync, pn: number): number;
    keyDown(ev: KeyboardEvent): void;
    private RGB_TO_RGBA;
    private eraseLine;
    twrConCharOut(callingMod: any, c: number, codePage: number): void;
    charOut(c32: string): void;
    putStr(str: string): void;
    twrConPutStr(callingMod: IWasmModule | IWasmModuleAsync, chars: number, codePage: number): void;
    setC32(location: number, str: string): void;
    twrConSetC32(callingMod: any, location: number, c32: number): void;
    twrConCls(): void;
    private setFillStyleRGB;
    private drawTrs80Graphic;
    private drawCell;
    setRangeJS(start: number, values: number[]): void;
    twrConSetRange(callingMod: IWasmModule | IWasmModuleAsync, chars: number, start: number, len: number): void;
    private drawRange;
    /*************************************************/
    twrConSetReset(callingMod: IWasmModule | IWasmModuleAsync, x: number, y: number, isset: boolean): void;
    twrConPoint(callingMod: IWasmModule | IWasmModuleAsync, x: number, y: number): boolean;
    twrConSetCursor(callingMod: IWasmModule | IWasmModuleAsync, location: number): void;
    twrConSetCursorXY(callingMod: IWasmModule | IWasmModuleAsync, x: number, y: number): void;
    twrConSetColors(callingMod: IWasmModule | IWasmModuleAsync, foreground: number, background: number): void;
    twrConCharIn_async(callingMod: IWasmModuleAsync): Promise<number>;
    twrConSetFocus(): void;
}
export default twrConsoleTerminal;
//# sourceMappingURL=twrconterm.d.ts.map