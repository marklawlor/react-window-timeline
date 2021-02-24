export function getIntervals(
  startDate: Date,
  endDate: Date,
  interval: number
): number[] {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startTime <= endTime)) {
    throw new Error('Invalid start and end time');
  }

  const dates = [];

  let currentTime = startTime;

  while (currentTime < endTime) {
    dates.push(currentTime);
    currentTime += interval;
  }

  return dates;
}

export function snapTime(time: number, snapDuration: number): number {
  if (snapDuration <= 0) {
    return time;
  }

  return Math.round(time / snapDuration) * snapDuration;
}

export function getPositionAtTime(
  time: number,
  startTime: number,
  intervalDuration: number,
  intervalWidth: number,
  sidebarWidth: number
) {
  const numberOfIntervals = (time - startTime) / intervalDuration;
  const left = numberOfIntervals * intervalWidth;

  return left + sidebarWidth;
}

export function getTimeAtPosition(
  left: number,
  startTime: number,
  intervalDuration: number,
  intervalWidth: number,
  sidebarWidth: number,
  snapDuration: number
): number {
  const actualLeft = left - sidebarWidth;
  const numberOfIntervals = actualLeft / intervalWidth;

  return snapTime(
    numberOfIntervals * intervalDuration + startTime,
    snapDuration
  );
}
