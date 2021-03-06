import FinnhubAPI, { MarketDataItem } from '@stoqey/finnhub';
import moment from 'moment';
import { FINNHUB_KEY } from './config';
import { log, verbose } from './log';
import { MilleEvents, MILLEEVENTS } from './MilleEvents';
import { getTimeDiff } from './utils/time.utils';
import { sendDataToMarketDataServer, fetchMarketData, GroupBy } from './utils/marketDataServer';

// Export mille events
export * from './MilleEvents';

export type TimeMode = 'secs' | 'mins' | 'hours';
export interface Start {
    startDate: Date;
    endDate?: Date;
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
export async function mille(args: Start): Promise<void> {
    const { startDate = new Date("2020-03-13 09:35:00"), debug = false, mode = 'secs', endDate = null } = args || {};
    const finnHubApi = new FinnhubAPI(FINNHUB_KEY);

    const milleEvents = MilleEvents.Instance;

    let market: IndexedData = {} as any;

    /*** TIME UTILS */
    const timeFormatWithMinutes = (date: Date): string => {
        const timeFormatted = moment(date).format('YYYYMMDD HH:mm');
        return timeFormatted;
    }

    const timeFormatWithHours = (date: Date): string => {
        const timeFormatted = moment(date).format('YYYYMMDD HH');
        return timeFormatted;
    }
    /*** TIME UTILS */


    // Get market data
    milleEvents.on(MILLEEVENTS.GET_DATA, async (symbols) => {

        log(MILLEEVENTS.GET_DATA, symbols)

        // TODO
        // Check difference in days,
        // Check if mode supports it
        // Get marketdata or ticks from finnhub
        // 
        // 1. Get symbols market data, 
        interface FetchedData {
            symbol: string,
            data: MarketDataItem[]
        };

        const fetchingMarketData: FetchedData[] = await Promise.all(symbols.map(
            symbol => new Promise((resolve, reject) => {

                async function syncWithMarketDataServer(marketData: MarketDataItem[], symbol: string) {
                    try {

                        // send data to marketdata server
                        await sendDataToMarketDataServer(marketData.map((i) => ({ ...i, symbol })));

                        setTimeout(() => {

                            // fetch data from exodus
                            (async function () {

                                // check mode
                                let range: GroupBy = '10s';

                                // TODO add more days, months, weeks e.t.c
                                switch (mode) {
                                    case 'hours':
                                        range = '1h';
                                    case 'mins':
                                        range = '1m';
                                    case 'secs':
                                    default:
                                        range = '1s';
                                }

                                const data = await fetchMarketData({
                                    endDate,
                                    startDate,
                                    symbol,
                                    range
                                });

                                // return the data here
                                return resolve({
                                    data,
                                    symbol
                                })
                            })();

                        }, 2000);
                    }
                    catch (error) {
                        console.log('failed to sync with mill', error)
                    }
                };

                async function getDataFromProvider() {
                    let data: MarketDataItem[] = [];
                    const daysDif = getTimeDiff(startDate, endDate || startDate, 'days');
                    // Check if we have endDate
                    if (endDate && daysDif > 1) {
                        // Fetch candles instead
                        // And mode must not be seconds
                        data = await finnHubApi.getCandles(symbol, startDate, endDate, '1');
                    }
                    else {
                        // only one day so just get tick data
                        let tickData = await finnHubApi.getTick(symbol, startDate);

                        // convert to MarketDataItem
                        data = tickData.map(td => ({
                            close: td.price,
                            date: td.date,
                            high: 0,
                            low: 0,
                            open: 0,
                            volume: td.volume
                        })) as MarketDataItem[];

                    }

                    log(`finnHubApi MILLEEVENTS.GET_DATA => `, `symbol=${symbol} marketData=${data && data.length}`);

                    // We have market data now
                    await syncWithMarketDataServer(data, symbol);
                };
                getDataFromProvider();
            })
        )) as any;


        fetchingMarketData.forEach(dataSymbol => {
            const { data: mkdata, symbol: curSymbol } = dataSymbol;

            const indexedData = {};

            // 1. loop thru all market data and add it to index
            mkdata.forEach(dItem => {
                const dItemDate = new Date(dItem.date);

                switch (mode) {
                    case 'hours':
                        indexedData[`${timeFormatWithHours(dItemDate)}`] = dItem;
                    case 'mins':
                        indexedData[`${timeFormatWithMinutes(dItemDate)}`] = dItem;
                    case 'secs':
                    default:
                        const dateWithoutMillieseconds = dItemDate.setMilliseconds(0);
                        indexedData[`${dateWithoutMillieseconds}`] = dItem;
                }

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

        let matchedDateStr: string = `${matchedDate.getTime()}`;

        switch (mode) {
            case 'hours':
                matchedDateStr = timeFormatWithHours(matchedDate);
            case 'mins':
                matchedDateStr = timeFormatWithMinutes(matchedDate);
            case 'secs':
            default:
                matchedDateStr = `${matchedDate.getTime()}`;
        };

        verbose(`stats = ${JSON.stringify(Object.keys(market))}`);


        // Find matching
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
        verbose(`⌚️⌚️⌚️HOURS--${startingTime} --⌚️⌚️⌚️`)
        // Increase time by 1 hour
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


        verbose(`⌚️⌚️⌚️MINS--${startingTime} --⌚️⌚️⌚️`)

        // Increase time by 1 min
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

        verbose(`⌚️⌚️⌚️SECS--${startingTime} --⌚️⌚️⌚️`)
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
            break;
        case 'mins':
            functionToRun = mins;
            break;
        case 'secs':
        default:
            functionToRun = seconds;
            break;
    }

    setInterval(functionToRun, 1000);

    return log(`--------------- Mille started ${(mode).toLocaleUpperCase()} -------------`);
}

export default mille;


