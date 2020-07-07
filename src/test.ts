import 'mocha';
import { expect } from 'chai';
import { mille, MILLEEVENTS, MilleEvents } from ".";

const milleEvents = MilleEvents.Instance;



describe('Mille Paper Trading', async () => {
    describe('in secs mode', async () => {

        const opt: any = {
            startDate: new Date("2020-03-13 09:35:00"),
            endDate: new Date("2020-03-13 16:35:00"),
            mode: 'secs',
        };

        it('should start properly', async () => {
            await mille(opt);
            expect(true).to.not.be.false;
        });

        it('should start properly and request for market data and match', async () => {
            await mille(opt);

            milleEvents.on(MILLEEVENTS.GET_DATA, async () => {

            })


            milleEvents.emit(MILLEEVENTS.GET_DATA, ["AAPL", "MSFT"])


        });

    });
})