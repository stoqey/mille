import FinnhubAPI, { MarketDataItem } from '@stoqey/finnhub';
import { FINNHUB_KEY } from './config';
interface Start {
    startDate: Date;
    endDate: Date;
    symbols: [string]
}

interface SymbolData {
    symbol: string;
    marketData: MarketDataItem[]
}

interface IndexedData {
    symbol: string;
    data: { [x: string]: MarketDataItem };
};

export async function mille(args?: Start) {
    const { startDate = new Date("2020-03-13 09:30:00"), symbols = ["NFLX"] } = args || {};

    const finnHubApi = new FinnhubAPI(FINNHUB_KEY);

    let market: IndexedData = {} as any;

    // 1. Get symbols market data, 
    const fetchMarketData: { symbol: string, data: MarketDataItem[] }[] = await Promise.all(symbols.map(
        symbol => new Promise((resolve, reject) => {
            async function getData() {
                const data = await finnHubApi.getTick(symbol, startDate);
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

            const dateWithoutMillieseconds = dItemDate.setMilliseconds(0);

            // TODO use moment instead

            // set data to index
            indexedData[`${dateWithoutMillieseconds}`] = dItem;
        });

        // 2. Add indexed data to market
        market[curSymbol] = {
            symbol: curSymbol,
            data: indexedData
        };
    });

    // @ts-ignore
    // console.log(market.NFLX);

    const matchTimeData = (matchedDate: Date) => {
        const matched = [];
        const matchedDateStr = `${matchedDate.getTime()}`;

        Object.keys(market).map(key => {

            const symbolData = market[key].data;

            const matchingTime = symbolData[matchedDateStr];

            if (matchingTime) {
                matched.push({
                    symbol: key,
                    tick: matchingTime
                });
            };

        });

        console.log('matched time is', matched);
    }

    let startingTime: Date = new Date(startDate);
    /**
     * Start loop
     */
    function seconds() {

        // Increase time by 1 sec
        startingTime = new Date(startingTime.setSeconds(startingTime.getSeconds() + 1));

        // Match
        // Emit all that exist
        matchTimeData(startingTime);
    }

    setInterval(seconds, 1000);
}

mille();


