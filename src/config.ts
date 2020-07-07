import dotenv from 'dotenv';

dotenv.config();

export const isDev = process.env.NODE_ENV !== 'production';

const { env } = process;

/**
 * MarketData server env
 */
export const marketDataServerHost = `http://${env.EXODUS_SERVICE_HOST || 'localhost'}`;
export const marketDataServerPort = env.EXODUS_SERVICE_PORT || 3009;


export const FINNHUB_KEY = env.FINNHUB_KEY;
