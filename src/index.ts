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

export async function millie(args?: Start) {
    const { startDate = new Date("2020-03-13 09:30:00"), endDate = new Date("2020-03-13 17:30:00"), symbols = ["NFLX"] } = args || {};

    const finnHubApi = new FinnhubAPI(FINNHUB_KEY);

    let market: IndexedData = {} as any;

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
    console.log(market.NFLX);




    /**
     * Start loop
     */
    // function seconds() {

    //     // Get symbols market data, 
    //     // Check all symbols market data if exit
    //     // Emit all that exist
    //     // 
    //     console.log('second is ');
    // }

    // setInterval(seconds, 1000);
}

millie();


