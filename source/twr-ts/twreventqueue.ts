import {twrSharedCircularBuffer} from "./twrcircular.js"
import {twrWasmModuleAsyncProxy} from "./twrmodasyncproxy.js";

const eventMarker=0x684610d6;    // random positive 32 bit value
const mallocMarker=0x51949385;   // random positive 32 bit value

export class twrEventQueueSend {
   circBuffer: twrSharedCircularBuffer=new twrSharedCircularBuffer();

//TOOD!! unify / rename TOnEventCallback = (eventID:number, ...args:number[])=>void;
   postEvent(eventID:number, ...params:number[]):void {
      this.circBuffer.writeArray([eventMarker, eventID, params.length, ...params]);
   }

   postMalloc(mallocID:number, size:number) {
      this.circBuffer.writeArray([mallocMarker, mallocID, size]);
   }
}

export type TOnEventCallback = (eventID:number, ...args:number[])=>void;


export class twrEventQueueReceive {
   circBuffer: twrSharedCircularBuffer;
   pendingEventIDs: number[];
   pendingEventArgs: (number[])[];
   ownerMod:twrWasmModuleAsyncProxy;
   static unqiueInt:number=1;
   static onEventCallbacks:(TOnEventCallback|undefined)[]=[];

   constructor(ownerMod:twrWasmModuleAsyncProxy, eventQueueBuffer:SharedArrayBuffer) {
      this.circBuffer=new twrSharedCircularBuffer(eventQueueBuffer);
      this.pendingEventIDs=[];
      this.pendingEventArgs=[];
      this.ownerMod=ownerMod;
   }

   private readEventRemainder() {
      const eventID=this.circBuffer.read();
      if (eventID===undefined) throw new Error ("internal error");
      const argLen=this.circBuffer.read();
      if (argLen===undefined) throw new Error ("internal error");
      const args:number[]=[];
      for (let i=0; i < argLen; i++) {
         const arg=this.circBuffer.read();
         if (arg===undefined) throw new Error ("internal error");
         args.push(arg);
      }

      if (!(eventID in twrEventQueueReceive.onEventCallbacks))
         throw new Error("internal error");

      this.pendingEventIDs.push(eventID);
      this.pendingEventArgs.push(args);
   }

   private readMallocRemainder() {
      const mallocID=this.circBuffer.read();
      if (mallocID===undefined) throw new Error ("internal error");
      const size=this.circBuffer.read();
      if (size===undefined) throw new Error ("internal error");
      const ptr=this.ownerMod.wasmMem.malloc(size);
      postMessage(["twrWasmModule", mallocID, "callCOkay", ptr]); // we are in the twrWasmModuleAsyncProxy main thread
   }

   private readCommandRemainder(firstValue:number|undefined) {
      if (firstValue===eventMarker) 
         this.readEventRemainder();
      else if (firstValue===mallocMarker) 
         this.readMallocRemainder();
      else
         throw new Error ("internal error -- eventMarker or mallocMarker expected but not found");
   }

   // called only if circBuffer not empty
   private readCommand() {
      const firstValue=this.circBuffer.read();
      this.readCommandRemainder(firstValue);
   }

   private readWaitCommand() {
      const firstValue=this.circBuffer.readWait();
      this.readCommandRemainder(firstValue);
   }

   private findEvent(filterEvent:number) : [undefined | number, undefined | number[], undefined | number] {

      if (filterEvent===undefined) {
         return [this.pendingEventIDs.shift(), this.pendingEventArgs.shift(), 0]
      }

      const index=this.pendingEventIDs.indexOf(filterEvent);
      if (index!=-1)
         return [this.pendingEventIDs.splice(index, 1)[0], this.pendingEventArgs.splice(index, 1)[0], index];

      return [undefined, undefined, undefined];
   }

   
   waitEvent(filterEvent:number) : [eventID:number, args:number[]] {
      while (true) {
         // empty the queue
         while (!this.circBuffer.isEmpty())
            this.readCommand();

         // is our event in the queue?
         const [eventID, args, index]=this.findEvent(filterEvent);
         // execute callbacks up to this filterEvent (so as to call them in order)
         // if filterEvent not found, index is undefined, which causes doCallbacks to execute all pendingEventIDs
         // this call commented out so that the C events act like JavaScript events/callbacks (only called when main function finishes)
         // to consider: allow callbacks in sync blocking functions like sleep (that use await in their implementations)
         //this.doCallbacks(index); 
         if (eventID && args) {
         return [eventID, args];
         }

         // wait for a new event
         this.readWaitCommand();
      }
   }

   private doCallbacks(upToIndex?:number) {
      const end=upToIndex?upToIndex:this.pendingEventIDs.length;
      //console.log("end",end, upToIndex, this.pendingEventIDs.length);
      for (let i=0; i<end; i++) {
         const eventID=this.pendingEventIDs[i];
         const args=this.pendingEventArgs[i];
         const onEventCallback=twrEventQueueReceive.onEventCallbacks[eventID];
         if (onEventCallback) {
            onEventCallback(eventID, ...args);
            this.pendingEventIDs.splice(i, 1);
            this.pendingEventArgs.splice(i, 1);
         }
      }
   }

   processIncomingCommands() {
      while (!this.circBuffer.isEmpty())
         this.readCommand();

      this.doCallbacks();
   }

   //see twrWasmModule.constructor - imports - twr_register_callback:this.registerCallback.bind(this), 
   //TODO!! This static method works for twrWasmModuleAsync, but when/if I implement message loop for twrWasmModule, this may need to change?
   static registerCallback(funcName:string, onEventCallback:TOnEventCallback) {
      if (!onEventCallback) throw new Error("registerCallback called with a function name that is not exported from the module")
      this.onEventCallbacks[++this.unqiueInt]=onEventCallback;
      return this.unqiueInt;
   }

   static registerEvent() {
      this.onEventCallbacks[++this.unqiueInt]=undefined;
      return this.unqiueInt;
   }

}