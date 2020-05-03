import EventEmitter from 'events';

export enum MILLEEVENTS {
    DATA = 'data',
    GET_DATA = 'get_data'
}

export class MilleEvents extends EventEmitter.EventEmitter {
    private cache = {};
    private static _instance: MilleEvents;

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private constructor() {
        super()
        // this.setMaxListeners(50); // set a maximum of 50 event listners
    }

}

