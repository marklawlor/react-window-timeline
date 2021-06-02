export interface EachDayOfIntervalOptions {
  start: number;
  end: number;
}
export default function eachDayOfInterval({
  start,
  end,
}: EachDayOfIntervalOptions): Date[] {
  const currentDate = new Date(start);

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(currentDate.getTime() <= new Date(end).getTime())) {
    throw new Error('Invalid interval');
  }
  const dates = [];

  currentDate.setHours(0, 0, 0, 0);

  const step = 1;

  while (currentDate.getTime() <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + step);
    currentDate.setHours(0, 0, 0, 0);
  }

  return dates;
}
