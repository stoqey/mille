// Envs
export const isDev = process.env.NODE_ENV !== 'production';


if (isDev) {
    require('dotenv').config();
}

const { env } = process;

export const FINNHUB_KEY = env.FINNHUB_KEY;
