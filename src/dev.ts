import { mille, MILLEEVENTS, MilleEvents } from ".";

const milleEvents = MilleEvents.Instance;

mille({
    startDate: new Date("2020-03-11 10:35:00"),
    endDate: new Date("2020-03-11 16:35:00"),
    mode: 'secs',
});

milleEvents.emit(MILLEEVENTS.GET_DATA, ["AAPL", "MSFT"])