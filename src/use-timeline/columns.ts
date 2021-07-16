import { TimelineState } from "./use-timeline-reducer";

import { TimelineColumn } from "../interfaces";

export function newVisibleColumns(state: TimelineState): TimelineState {
  const {
    startTime,
    intervalWidth,
    paddingLeft,
    visualIntervalDuration,
    overscanColumnStartIndex,
    overscanColumnStopIndex,
  } = state;

  const columns: TimelineColumn[] = [];

  for (
    let index = overscanColumnStartIndex;
    index <= overscanColumnStopIndex;
    index++
  ) {
    columns.push({
      index,
      key: `column:${index}`,
      start: startTime + index * visualIntervalDuration,
      end: startTime + index * visualIntervalDuration + visualIntervalDuration,
      width: intervalWidth,
      left: paddingLeft + intervalWidth * index,
    });
  }

  return {
    ...state,
    columns,
  };
}
