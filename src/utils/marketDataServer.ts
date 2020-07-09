import axios from 'axios';
import querystring from 'querystring';
import { marketDataServerPort, marketDataServerHost } from '../config';
import { log } from '../log';
import { MarketDataItem } from '@stoqey/finnhub';

export type GroupBy = '1s' | '10s' | '1m' | '5m' | '10m' | '30m' | '1h' | '6h' | '12h' | '1d' | '7d' | '30d' | '365d';


const serverName = 'MarketData:EXODUS';
/**
 *
 * @param params
 * @param targetPath
 */
export async function fetchMarketData({
    symbol,
    startDate,
    endDate,
    range
}: {
    symbol: any;
    startDate: Date;
    endDate?: Date;
    range?: GroupBy;
}): Promise<MarketDataItem[]> {
    // const cloneStartDate = new Date(startDate);
    // const endingDate = new Date(endDate || new Date(cloneStartDate.setDate(cloneStartDate.getDate() - 1)));

    if (!startDate) {
        log('startDate is null', startDate);
        return null;
    }

    const opt: Record<string, any> = {
        symbol,
        startDate: startDate.toISOString(),
    };

    // add range 
    if (range) {
        opt.range = range;
    }

    // if we have the date
    if (endDate) {
        opt.endDate = endDate.toISOString();
    }

    // http://localhost:3009/v1/query?range=1m&startDate=2020-04-30T15:12:35.005Z
    let url = `${marketDataServerHost}:${marketDataServerPort}/v1/query?${querystring.stringify(opt)}`;

    log('url is', url);

    let response: MarketDataItem[] = [];

    try {
        const { data }: { data: MarketDataItem[] } = await axios.get(url);
        response = data;
        log(`successfully got market data from ${serverName}`, response && response.length);
    } catch (error) {
        log(`error getting market data from ${serverName}`, error && error.message);
    } finally {
        return response;
    }
}

/**
 *
 * @param params
 * @param targetPath
 */
export async function sendDataToMarketDataServer(
    params: Record<string, any>,
    targetPath?: string
): Promise<Record<string, any>> {
    const url = `${marketDataServerHost}:${marketDataServerPort}/${targetPath || 'v1/insert'}`;
    try {
        await axios.post(url, params, {
            timeout: 900,
        });
        log(`successfully sent data to ${serverName}`, params && params[0].symbol);
    } catch (error) {
        log(`error sending data to ${serverName}`, error && error.message);
    } finally {
        return params;
    }
}
