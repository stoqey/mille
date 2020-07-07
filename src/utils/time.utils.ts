import moment, { unitOfTime } from 'moment';

export const getTimeDiff = (start: Date, end: Date, as: unitOfTime.Base): number => {
    const startingTime = moment(start);
    const endingTime = moment(end);
    const duration = moment.duration(endingTime.diff(startingTime));
    return duration.as(as);
};