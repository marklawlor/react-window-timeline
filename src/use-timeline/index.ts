import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  DataAtPosition,
  HierarchyNode,
  Item,
  TimelineControl,
} from "../interfaces";

import {
  TimelineState,
  useTimelineReducer,
  useTimelineReducerInitial,
} from "./use-timeline-reducer";
import { useTimelineControl } from "./use-timeline-control";
import { getSnappedTime, getTimeAtPosition } from "../utils/time";

export interface UseTimelineOptions {
  height: number;
  width: number;

  startTime: number;
  endTime: number;

  hierarchy: HierarchyNode[];
  expandedNodeIds?: Array<HierarchyNode["id"]>;

  items: Item[];
  itemHeight: number;
  minItemWidth?: number;

  intervalWidth: number;

  intervalDuration: number;
  visualIntervalDuration: number;

  snapDuration?: number;
  initialScrollTime?: number;

  minRowHeight?: number;
  rowVerticalPadding?: number;
  estimatedRowHeight?: number;

  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

export interface UseTimeline extends TimelineState {
  control: TimelineControl;
  snapTime: (time: number) => number;
  dataAtPosition: DataAtPosition;
  resetAfterRowIndex: (index: number, shouldForceUpdate?: boolean) => void;
}

export function useTimeline({
  startTime,
  endTime,

  height,
  width,

  hierarchy,
  expandedNodeIds,

  items,
  itemHeight,
  minItemWidth = 0,

  intervalWidth,

  intervalDuration,

  visualIntervalDuration = intervalDuration,

  rowVerticalPadding = 10,
  minRowHeight = 10,
  estimatedRowHeight = itemHeight,

  paddingLeft = 0,
  paddingTop = 0,

  snapDuration = 1,
}: UseTimelineOptions): UseTimeline {
  const outerRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(
    useTimelineReducer,
    {
      type: "update",
      originalHierarchy: hierarchy,
      originalItems: items,
      expandedNodeIds,

      startTime,
      endTime,
      itemHeight,
      minItemWidth,

      minRowHeight,
      rowVerticalPadding,
      estimatedRowHeight,

      paddingLeft,
      paddingTop,

      intervalWidth,
      intervalDuration,
      visualIntervalDuration,
    },
    useTimelineReducerInitial
  );

  useEffect(() => {
    dispatch({
      type: "update",
      originalHierarchy: hierarchy,
      originalItems: items,
      expandedNodeIds: expandedNodeIds,
      startTime,
      endTime,
      paddingLeft,
      intervalWidth,
      intervalDuration,
      visualIntervalDuration,
    });
  }, [
    dispatch,
    hierarchy,
    expandedNodeIds,
    startTime,
    endTime,
    paddingLeft,
    intervalWidth,
    intervalDuration,
    visualIntervalDuration,
    items,
  ]);

  // useEffect(() => {
  //   dispatch({
  //     type: "newItems",
  //     itemHeight,
  //   });
  // }, [dispatch, items, itemHeight]);

  const { allRows } = state;

  const control = useTimelineControl({
    height,
    width,
    dispatch,
    outerRef,
    ...state,
  });

  const snapTime = useCallback(
    (time: number) => {
      return getSnappedTime(time, snapDuration);
    },
    [snapDuration]
  );

  const dataAtPosition = useCallback<DataAtPosition>(
    (
      { x, y },
      {
        duration = visualIntervalDuration,
        width = intervalWidth,
        scrollLeft = outerRef.current?.scrollLeft || 0,
      } = {}
    ) => {
      const outerElement = outerRef.current?.getBoundingClientRect() || {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };

      // const scrollLeft = outerRef.current?.scrollLeft || 0;
      const scrollTop = outerRef.current?.scrollTop || 0;

      const left = x + scrollLeft - outerElement.left;
      const top = y + scrollTop - outerElement.top - paddingTop;

      const row = allRows.find((row) => {
        return row.top <= top && row.top + row.height >= top;
      });

      const suggestedRow = row || allRows[top < 0 ? 0 : allRows.length - 1];

      const time = Math.max(
        startTime,
        getTimeAtPosition(
          left,
          startTime,
          visualIntervalDuration,
          intervalWidth,
          paddingLeft,
          snapDuration
        )
      );

      let suggestedItem: ReturnType<DataAtPosition>["suggestedItem"];
      if (suggestedRow) {
        const end = width
          ? getTimeAtPosition(
              left + width,
              startTime,
              visualIntervalDuration,
              intervalWidth,
              paddingLeft,
              snapDuration
            )
          : time + duration;

        suggestedItem = {
          nodeId: suggestedRow.id,
          start: time,
          end,
        };
      }

      return {
        time,
        row,
        suggestedRow,
        suggestedItem,
      };
    },
    [outerRef, allRows]
  );

  const resetAfterRowIndex = useCallback(
    (index: number, shouldForceUpdate: boolean = true) => {
      control.ref.current?.resetAfterRowIndex(index, shouldForceUpdate);
    },
    []
  );

  return {
    ...state,
    control,
    snapTime,
    dataAtPosition: dataAtPosition,
    resetAfterRowIndex,
  };
}
