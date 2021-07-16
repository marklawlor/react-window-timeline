import {
  useRef,
  useCallback,
  useState,
  useEffect,
  Dispatch,
  RefObject,
} from "react";
import { GridOnItemsRenderedProps, VariableSizeGrid } from "react-window";

import { TimelineControl } from "../interfaces";
import { Action, TimelineState } from "./use-timeline-reducer";

export interface UseTimelineControlOptions extends TimelineState {
  height: number;
  width: number;
  dispatch: Dispatch<Action>;
  outerRef: RefObject<any>;
}

export function useTimelineControl({
  height,
  width,

  allRows,

  startTime,
  endTime,
  visualIntervalDuration,

  rowOffsets,

  itemHeight,
  minRowHeight,
  rowVerticalPadding,
  paddingTop,

  intervalWidth,
  paddingLeft,
  estimatedRowHeight,

  outerRef,
  dispatch,
}: UseTimelineControlOptions): TimelineControl {
  const ref = useRef<VariableSizeGrid>(null);

  const rowCount = Math.max(allRows.length, 1);
  const columnCount =
    Math.ceil((endTime - startTime) / visualIntervalDuration) || 0;

  const onItemsRendered = useCallback(
    (props: GridOnItemsRenderedProps) => {
      dispatch({
        ...props,
        type: "onItemsRendered",
      });
    },
    [dispatch]
  );

  const rowHeight = useCallback(
    (index: number) => {
      const offset = rowOffsets[index];

      if (!offset) {
        return estimatedRowHeight;
      }

      return Math.max(minRowHeight, rowVerticalPadding + offset * itemHeight);
    },
    [rowOffsets, minRowHeight, itemHeight, paddingTop, rowVerticalPadding]
  );

  const columnWidth = useCallback(
    (index) => {
      if (index === 0) {
        return intervalWidth + paddingLeft;
      }

      return intervalWidth;
    },
    [intervalWidth, paddingLeft]
  );

  const didMountRef = useRef(false);

  const [timelineControl, setTimelineControl] = useState<TimelineControl>({
    height,
    width,
    ref,
    outerRef,
    rowCount,
    rowHeight,
    columnCount,
    columnWidth,
    estimatedColumnWidth: intervalWidth,
    onItemsRendered,
  });

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    console.log(
      "generating new control",
      height,
      width,
      rowCount,
      columnCount,
      intervalWidth
    );

    setTimelineControl((previousControl) => ({
      ...previousControl,
      height,
      width,
      rowCount,
      columnCount,
      estimatedColumnWidth: intervalWidth,
    }));
  }, [height, width, rowCount, columnCount, intervalWidth]);

  return timelineControl;
}
