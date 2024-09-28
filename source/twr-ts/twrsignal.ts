//
// This class implements a simple signal/wait mechanism
// It is used by the WebWorker thread to block/wait, and the main JS thread to signal when to unblock
//

enum twrSignalState {
    WAITING=0,
    SIGNALED=1
};

export class twrSignal {
	saBuffer:SharedArrayBuffer;
	i32Array:Int32Array;

 	constructor (sa?:SharedArrayBuffer) {
        if (typeof window !== 'undefined') { // this check only works if window valid
            if (!crossOriginIsolated && !(window.location.protocol === 'file:')) 
                throw new Error("twrSignal constructor, crossOriginIsolated="+crossOriginIsolated+". See SharedArrayBuffer docs.");
        }
        if (sa) this.saBuffer=sa;
        else this.saBuffer=new SharedArrayBuffer(4);
		this.i32Array=new Int32Array(this.saBuffer);
        this.i32Array[0]=twrSignalState.WAITING;
	}

	signal() {
        this.i32Array[0]=twrSignalState.SIGNALED;  
        //console.log("about to signal");
        Atomics.notify(this.i32Array, 0);   
	}

    wait() {
        if (this.i32Array[0]==twrSignalState.WAITING) {
            //console.log("waiting...");
            Atomics.wait(this.i32Array, 0, twrSignalState.WAITING);
            //console.log("released...");

        }
	}
    isSignaled():boolean {
        return this.i32Array[0]==twrSignalState.SIGNALED;
    }

    reset() {
        this.i32Array[0]=twrSignalState.WAITING;
    }
}
