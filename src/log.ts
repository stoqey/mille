import debug from 'debug';

const prefix = 'mille';

/**
 * Use to log in general case
 */
export const log = debug(`${prefix}:info`);

/**
 * Use for verbose log
 */
export const verbose = debug(`${prefix}:verbose`);