
import {twrWasmModule} from "tiny-wasm-runtime";

export async function fftDemo() {

    const mod=new twrWasmModule();

    // load the kiss_fft C code as is, unmodified
    await mod.loadWasm('kiss_fft.wasm');

    //  kissFFTData stores and graphs the input and output data
    //  in this example the fft has 1024 bins, and I am using a 48K sampling rate
    let fft=new kissFFTData(1024, 48000);
    fft.genSin(1000)
    fft.addSin(5000)
    fft.graphIn("c-input");

    // see kiss_fft README, but in summary you: (a) alloc config, (b) compute the FFT, (c) free the config
    // kiss_fft_alloc() returns a malloced structure.  Pointers are numbers (index into wasm module memory) in JS land 
    //
    //kiss_fft_cfg cfg = kiss_fft_alloc( nfft ,is_inverse_fft ,0,0 );
    let cfg:number = await mod.executeC(["kiss_fft_alloc", fft.nfft, 0, 0, 0 ]);

    // The FFT input and output data are C arrays of complex numbers.
    // typedef struct {
    //    kiss_fft_scalar r;
    //    kiss_fft_scalar i;
    // } kiss_fft_cpx;
    // /*  default is float */
    // define kiss_fft_scalar float
    //
    // So if the FFT data has 1024 bins, then 1024 * 2 floats (r & i) * 4 bytes per float are needed.
    // I use a JS Float32Array view on the ArrayBuffer to access the floats

    // for the data passed in, mod.executeC will convert an ArrayBuffer by mallocing memory and copying in the data
    // An ArrayBuffer is also used for the returned data.  
    // But i need to malloc the memory, pass in the memory, and copy out the data as follows

    let outmem:number=await mod.malloc(fft.outArrayBuf.byteLength);
    if (outmem==0) throw new Error("malloc failed!");

    // void kiss_fft(kiss_fft_cfg cfg,const kiss_fft_cpx *fin,kiss_fft_cpx *fout);
    await mod.executeC(["kiss_fft", cfg, fft.inArrayBuf, outmem]);

    // copy data out of the module memory into my ArrayBuffer that kissFFTData created to hold the output data
    let u8=new Uint8Array(fft.outArrayBuf);
    for (let i=0; i<u8.length; i++)
        u8[i]=mod.mem8[outmem+i];   // mod.mem8 is a Uint8Array view of the module's Web Assembly Memory

    fft.graphOut("c-output");
            
    await mod.executeC(["twr_free", outmem]);   // not much point to this since all the module memory is about to disappear
    await mod.executeC(["twr_free", cfg]);      // not much point to this since all the module memory is about to disappear
}

// this class holds the in and out data, 
// and provides functions generate sine waves 
// and to graph the input and output data
class kissFFTData {
    nfft:number;
    sampleRate:number;
    scaleIn:number;
    inArrayBuf:ArrayBuffer;
    in:Float32Array;
    outArrayBuf:ArrayBuffer;
    out:Float32Array;

    constructor(nfft:number, sampleRate:number) {
        this.nfft=nfft;
        this.sampleRate=sampleRate;
        this.scaleIn=0;

        this.inArrayBuf=new ArrayBuffer(nfft*2*4);   // 2 floats per entry, 4 bytes per 32bit float
        this.in=new Float32Array(this.inArrayBuf);
        for (let i=0; i < nfft*2; i++) {
            this.in[i]=0;
        }
        this.outArrayBuf=new ArrayBuffer(nfft*2*4);
        this.out=new Float32Array(this.outArrayBuf);
    }

    degToRad(deg:number) {
        return deg*2*Math.PI/360;
    }

    setInReal(index:number, value:number) {
        this.in[index*2]=value;
    }

    getInReal(index:number) {
        return this.in[index*2];
    }

    getOutReal(index:number) {
        const a=this.out[index*2];
        const b=this.out[index*2+1];

        return Math.sqrt(a*a+b*b);
    }

    genSin(freq:number) {
        this.scaleIn=1;
        for (let i=0; i<this.nfft; i++) {
            const angle=2*Math.PI * freq * (i/this.sampleRate);
            //console.log(angle);
            this.setInReal(i, Math.sin(angle));
        }
    }

    addSin(freq:number) {
        this.scaleIn++;
        for (let i=0; i<this.nfft; i++) {
            const angle=2*Math.PI * freq * (i/this.sampleRate);
            const r=this.getInReal(i);
            this.setInReal(i, r+Math.sin(angle));
        }
    }

    graphIn(canvasID:string) {
        const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        if (!canvas) throw new Error("canvas ID "+canvasID+" not found");
        if (!canvas.getContext) throw new Error("unexpected error: canvas.getContext is null");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("unexpected null context");

        const midlineY=canvas.height/2;
        const width=canvas.width;
        const height=canvas.height/2/this.scaleIn;
        const step=width/this.nfft;

        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, midlineY);
        ctx.lineTo(width, midlineY);
        ctx.stroke();

        ctx.strokeStyle = 'black';
    
        const y=midlineY+this.getInReal(0)*height;
        ctx.moveTo(0, y);

        ctx.beginPath();
        for (let i=1; i < this.nfft; i++) {
            const x=i*step;
            const y=midlineY+this.getInReal(i)*height;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    graphOut(canvasID:string) {
        const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        if (!canvas) throw new Error("canvas ID "+canvasID+" not found");
        if (!canvas.getContext) throw new Error("unexpected error: canvas.getContext is null");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("unexpected null context");

        const width=canvas.width;
        const step=width/this.nfft;

        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(width, canvas.height);
        ctx.stroke();

        ctx.strokeStyle = 'black';
    

        ctx.beginPath();
        for (let i=0; i < this.nfft; i++) {
            const x=i*step;
            ctx.moveTo(x, canvas.height);
            const y=canvas.height-this.getOutReal(i)/this.nfft*canvas.height;
            console.log(x, y, this.getOutReal(i));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
