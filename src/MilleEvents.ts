import EventEmitter from 'events';

export enum MILLEEVENTS {
    DATA = 'data',

    /**
     * [string]
     */
    GET_DATA = 'get_data',

    /**
     * { symbols: string[], time: Date }
     */
    TIME_TICK = 'time_tick',

}

export class MilleEvents extends EventEmitter.EventEmitter {
    private static _instance: MilleEvents;

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private constructor() {
        super()
        // this.setMaxListeners(50); // set a maximum of 50 event listners
    }

}

