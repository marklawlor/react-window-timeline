// import { Dispatch, SetStateAction, useCallback, useState } from "react";
// import { GridOnItemsRenderedProps } from "react-window";
// import { UseTimelineOptions } from ".";
// import {
//   Item,
//   TimelineColumn,
//   TimelineInterval,
//   TimelineItem,
// } from "../interfaces";
// import { Row } from "../row";
// import { rangeInclusive } from "../utils/range";
// import { getPositionAtTime } from "../utils/time";

// export interface UseVisibleAreaOptions extends Required<UseTimelineOptions> {
//   rows: Row[];
//   intervals: TimelineInterval[];
// }

// export interface VisibleAreaState {
//   columns: TimelineColumn[];
//   items: TimelineItem[];
//   intervals: TimelineInterval[];
// }

// export interface UseVisibleArea extends VisibleAreaState {
//   onItemsRendered: (props: GridOnItemsRenderedProps) => void;
//   setStickyItems: Dispatch<SetStateAction<Item[]>>;
// }

// export function useVisibleArea({
//   rows,

//   startTime,
//   intervalWidth,
//   intervalDuration,
//   intervals,

//   paddingLeft,
//   minItemWidth,
//   itemHeight,
// }: UseVisibleAreaOptions): UseVisibleArea {
//   const [visibleAreaState, setVisibleAreaState] = useState<VisibleAreaState>({
//     columns: [],
//     items: [],
//     intervals: [],
//   });

//   const [stickyItems, setStickyItems] = useState<Item[]>([]);

//   const onItemsRendered = useCallback(
//     ({
//       overscanColumnStartIndex,
//       overscanColumnStopIndex,
//       overscanRowStartIndex,
//       overscanRowStopIndex,
//     }: GridOnItemsRenderedProps) => {
//       const stickyRows: Row[] = [];

//       const visibleRange = rangeInclusive(
//         overscanColumnStartIndex,
//         overscanColumnStopIndex
//       );

//       const visibleIntervals = visibleRange.map((index) => intervals[index]);

//       const columns: TimelineColumn[] = visibleRange.map((index) => ({
//         index,
//         key: `column:${intervals[index].interval}`,
//         left: paddingLeft + intervalWidth * index,
//         width: intervalWidth,
//         interval: intervals[index].interval,
//       }));

//       const visibleRows = Array.from(
//         new Set([
//           ...stickyRows,
//           ...rows.slice(
//             overscanRowStartIndex,
//             // Need to include the +1 as slice does not include the end
//             overscanRowStopIndex + 1
//           ),
//         ])
//       ).sort((a, b) => a.index - b.index);

//       const stickyLeafNodeId = stickyItems.map((item) => item.nodeId);

//       const items: TimelineItem[] = visibleRows.flatMap((row) => {
//         const stickyRowItems = stickyLeafNodeId.includes(row.leafNodeId)
//           ? row.getItemsByIds(stickyLeafNodeId)
//           : [];

//         const rowItems = new Set([
//           ...stickyRowItems,
//           ...row.getItemsByIntervalRange(
//             overscanColumnStartIndex,
//             overscanColumnStopIndex,
//             intervals
//           ),
//         ]);

//         return Array.from(rowItems).map((item) => {
//           const left = getPositionAtTime(
//             item.start,
//             startTime,
//             intervalDuration,
//             intervalWidth
//           );

//           const width = Math.max(
//             getPositionAtTime(
//               item.end,
//               startTime,
//               intervalDuration,
//               intervalWidth
//             ) - left,
//             minItemWidth
//           );

//           const top = row.top + row.getItemTopOffset(item, itemHeight);

//           const isStickyItem = stickyRowItems.includes(item);

//           return {
//             key: `item:${item.id}`,
//             height: 20,
//             isStickyItem,
//             item,
//             left,
//             top,
//             width,
//           };
//         });
//       });

//       setVisibleAreaState({
//         columns,
//         intervals: visibleIntervals,
//         items,
//       });
//     },
//     [rows, stickyItems]
//   );

//   return {
//     onItemsRendered,
//     setStickyItems,
//     ...visibleAreaState,
//   };
// }
