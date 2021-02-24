import { getIntervals } from './utils/time';

export default function getDimensions(
  start: Date,
  end: Date,
  intervalDuration: number,
  intervalWidth: number,
  sidebarWidth: number,
  width: number
) {
  const intervals = getIntervals(
    new Date(start),
    new Date(end),
    intervalDuration
  );

  return {
    intervalWidth: (width - sidebarWidth) / intervals.length + intervalWidth,
    intervals,
    sidebarWidth,
    width,
  };
}
