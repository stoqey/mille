import { mille, MILLEEVENTS, MilleEvents } from ".";

const milleEvents = MilleEvents.Instance;

mille();

milleEvents.emit(MILLEEVENTS.GET_DATA, ["AAPL", "MSFT"])