import FinnhubAPI, { MarketDataItem } from '@stoqey/finnhub';
import { FINNHUB_KEY } from './config';
import { log, verbose } from './log';
import { MilleEvents, MILLEEVENTS } from './MilleEvents';

// Export mille events
export * from './MilleEvents';

export type TimeMode = 'secs' | 'mins' | 'hours';
interface Start {
    date: Date;
    mode: TimeMode;
    debug?: boolean;
}

interface IndexedData {
    symbol: string;
    data: { [x: string]: MarketDataItem };
};

/**
 * mille
 * {
 *   @param startDate 
 *   @param symbols
 *   @param mode sec | min | 10 min | 1 hour
 * } 
 */
export async function mille(args?: Start) {
    const { date: startDate = new Date("2020-03-13 09:35:00"), debug = false, mode = 'secs' } = args || {};
    const finnHubApi = new FinnhubAPI(FINNHUB_KEY);

    const milleEvents = MilleEvents.Instance;

    let market: IndexedData = {} as any;


    // Get market data
    milleEvents.on(MILLEEVENTS.GET_DATA, async (symbols) => {

        log(MILLEEVENTS.GET_DATA, symbols)

        // TODO
        // Check difference in days,
        // Check if mode supports it
        // Get marketdata or ticks from finnhub
        // 
        // 1. Get symbols market data, 
        const fetchMarketData: { symbol: string, data: MarketDataItem[] }[] = await Promise.all(symbols.map(
            symbol => new Promise((resolve, reject) => {
                async function getData() {
                    const data = await finnHubApi.getTick(symbol, startDate);

                    log(`finnHubApi ${MILLEEVENTS.GET_DATA} => `, `symbol${symbol} market data=${data && data.length}`);

                    return resolve({
                        data,
                        symbol
                    })
                };
                getData();
            })
        )) as any;

        fetchMarketData.forEach(dataSymbol => {
            const { data: mkdata, symbol: curSymbol } = dataSymbol;

            const indexedData = {};

            // 1. loop thru all market data and add it to index
            mkdata.forEach(dItem => {
                const dItemDate = new Date(dItem.date);

                // TODO set hours, mins
                const dateWithoutMillieseconds = dItemDate.setMilliseconds(0);

                // set data to index
                indexedData[`${dateWithoutMillieseconds}`] = dItem;
            });

            // 2. Add indexed data to market
            market[curSymbol] = {
                symbol: curSymbol,
                data: indexedData
            };
        });
    })

    // TODO get market data from exodus
    const matchTimeData = (matchedDate: Date) => {
        const matched = [];
        const matchedDateStr = `${matchedDate.getTime()}`;

        verbose(`stats = ${JSON.stringify(Object.keys(market))}`);

        Object.keys(market).map(key => {

            const symbolData = market[key].data;
            // verbose(`stats > ${key} stats = ${Object.keys(symbolData || {}).length}`);

            const matchingTime = symbolData[matchedDateStr];

            if (matchingTime) {

                const dataToSend = {
                    symbol: key,
                    tick: matchingTime
                }

                // Add data to matched
                matched.push(dataToSend);

                console.log('dataToSend ---------------------> ', dataToSend)
                // Emit to all listens
                milleEvents.emit(`${MILLEEVENTS.DATA}-${key}`, dataToSend); // direct event
                milleEvents.emit(`${MILLEEVENTS.DATA}`, dataToSend); // All general
            };

        });

        // Print all matched symbols
        log('matched time is', matched);
    }

    let startingTime: Date = new Date(startDate);

    /**
     * Start loop for hours
     */
    function hours() {
        verbose(`⌚️⌚️⌚️--${startingTime} --⌚️⌚️⌚️`)
        // Increase time by 1 sec
        startingTime = new Date(startingTime.setHours(startingTime.getHours() + 1));

        // Run Matcher
        // Emit all that exist
        matchTimeData(startingTime);
        milleEvents.emit(MILLEEVENTS.TIME_TICK, { time: startingTime, symbols: Object.keys(market) })
    }

    /**
     * Start loop for mins
     */
    function mins() {

        verbose(`⌚️⌚️⌚️--${startingTime} --⌚️⌚️⌚️`)
        // Increase time by 1 sec
        startingTime = new Date(startingTime.setMinutes(startingTime.getMinutes() + 1));

        // Run Matcher
        // Emit all that exist
        matchTimeData(startingTime);
        milleEvents.emit(MILLEEVENTS.TIME_TICK, { time: startingTime, symbols: Object.keys(market) })
    }


    /**
     * Start loop for seconds
     */
    function seconds() {

        verbose(`⌚️⌚️⌚️--${startingTime} --⌚️⌚️⌚️`)
        // Increase time by 1 sec
        startingTime = new Date(startingTime.setSeconds(startingTime.getSeconds() + 1));

        // Run Matcher
        // Emit all that exist
        matchTimeData(startingTime);
        milleEvents.emit(MILLEEVENTS.TIME_TICK, { time: startingTime, symbols: Object.keys(market) })
    }

    let functionToRun = seconds;

    switch (mode) {
        case 'hours':
            functionToRun = hours;
        case 'mins':
            functionToRun = mins;
        case 'secs':
        default:
            functionToRun = seconds;
    }

    setInterval(functionToRun, 1000);

    log('--------------- Mille started -------------');

}

export default mille;


