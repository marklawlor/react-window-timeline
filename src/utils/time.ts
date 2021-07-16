export function getIntervals(
  startDate: Date,
  endDate: Date,
  interval: number
): number[] {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startTime <= endTime)) {
    throw new Error("Invalid start and end time");
  }

  const dates = [];

  let currentTime = startTime;

  while (currentTime < endTime) {
    dates.push(currentTime);
    currentTime += interval;
  }

  return dates;
}

export function getSnappedTime(time: number, snapDuration: number): number {
  if (snapDuration <= 0) {
    return time;
  }

  return Math.round(time / snapDuration) * snapDuration;
}

export function getPositionAtTime(
  time: number,
  startTime: number,
  visualIntervalDuration: number,
  intervalWidth: number,
  paddingLeft: number
) {
  const visualInterval = (time - startTime) / visualIntervalDuration;
  return paddingLeft + visualInterval * intervalWidth;
}

export function getTimeAtPosition(
  left: number,
  startTime: number,
  visualIntervalDuration: number,
  intervalWidth: number,
  paddingLeft: number,
  snapDuration: number
): number {
  const numberOfIntervals = (left - paddingLeft) / intervalWidth;

  return getSnappedTime(
    numberOfIntervals * visualIntervalDuration + startTime,
    snapDuration
  );
}
