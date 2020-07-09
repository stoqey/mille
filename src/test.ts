import 'mocha';
import { expect } from 'chai';
import { mille, MILLEEVENTS, MilleEvents } from ".";

const milleEvents = MilleEvents.Instance;


const symbol = 'AAPL';

describe('Mille Paper Trading', async () => {
    describe('in secs mode', async () => {

        const opt: any = {
            symbol,
            startDate: new Date("2020-03-11 10:35:00"),
            endDate: new Date("2020-03-11 16:35:00"),
            mode: 'secs',
        };

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