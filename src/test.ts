import 'mocha';
import { expect } from 'chai';
import { mille, MILLEEVENTS, MilleEvents, Start } from ".";

const milleEvents = MilleEvents.Instance;


const symbol = 'AAPL';
const opt: Start & Record<string, any> = {
    symbol,
    startDate: new Date("2020-03-11 10:35:00"),
    endDate: new Date("2020-03-11 16:35:00"),
    mode: 'secs',
};

describe('Mille Paper Trading', async () => {
    describe('in secs mode', async () => {

        it('should start properly', async () => {
            await mille(opt);
            expect(true).to.not.be.false;
        });

        it('should start properly and request for market data and match', (done) => {

            let completed = false;
            mille(opt);

            milleEvents.on(`${MILLEEVENTS.DATA}-${opt.symbol}`, async () => {
                console.log('got market data for this item');
                if (!completed) {
                    done();
                    completed = true;
                }

            })

            milleEvents.emit(MILLEEVENTS.GET_DATA, [symbol])

        });

    });

    describe('in mins mode', async () => {

        opt.mode = 'mins';

        it('should start properly', async () => {
            await mille(opt);
            expect(true).to.not.be.false;
        });

        it('should start properly and request for market data and match', (done) => {

            let completed = false;
            mille(opt);

            milleEvents.on(`${MILLEEVENTS.DATA}-${opt.symbol}`, async () => {
                console.log('got market data for this item');
                if (!completed) {
                    done();
                    completed = true;
                }

            })

            milleEvents.emit(MILLEEVENTS.GET_DATA, [symbol])

        });

    });

    describe('in hours mode', async () => {

        opt.mode = "hours";

        it('should start properly', async () => {
            await mille(opt);
            expect(true).to.not.be.false;
        });

        it('should start properly and request for market data and match', (done) => {

            let completed = false;
            mille(opt);

            milleEvents.on(`${MILLEEVENTS.DATA}-${opt.symbol}`, async () => {
                console.log('got market data for this item');
                if (!completed) {
                    done();
                    completed = true;
                }

            })

            milleEvents.emit(MILLEEVENTS.GET_DATA, [symbol])

        });

    });
})