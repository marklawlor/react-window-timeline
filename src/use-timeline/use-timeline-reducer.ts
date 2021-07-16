import { GridOnItemsRenderedProps } from "react-window";
import {
  HierarchyNode,
  Item,
  MappedDataNode,
  TimelineColumn,
  TimelineHierarchy,
  TimelineItem,
  TimelineRow,
} from "../interfaces";

import { newGroupedItems, newVisibleItems } from "./items";
import { newHierarchyRecord } from "./hierarchy";
import { newRows, newVisibleRows } from "./rows";
import { newVisibleColumns } from "./columns";

export type TimelineState = {
  originalHierarchy: HierarchyNode[];
  originalItems: Item[];
  expandedNodeIds?: HierarchyNode["id"][];

  startTime: number;
  endTime: number;

  rows: TimelineRow[];
  allRows: TimelineRow[];
  rowOffsets: number[];
  itemOffsetCache: WeakMap<TimelineItem, number>;

  items: TimelineItem[];
  groupedItems: Array<Array<Array<Item>>>;
  itemsInViewCache: Record<
    string,
    { items: TimelineItem[]; maxOffset: number }
  >;

  hierarchy: TimelineHierarchy[];
  hierarchyRecord: Record<HierarchyNode["id"], MappedDataNode>;

  allColumns: TimelineColumn[];
  columns: TimelineColumn[];

  overscanColumnStartIndex: number;
  overscanColumnStopIndex: number;
  overscanRowStartIndex: number;
  overscanRowStopIndex: number;

  itemHeight: number;
  minItemWidth: number;

  intervalWidth: number;

  intervalDuration: number;
  visualIntervalDuration: number;

  minRowHeight: number;
  estimatedRowHeight: number;
  rowVerticalPadding: number;

  paddingTop: number;
  paddingLeft: number;

  // renderedItems: (props: GridOnItemsRenderedProps, items: Item[]) => Item[];
};

export type Action = UpdateAction | OnItemsRenderedAction;

export type OnItemsRenderedAction = GridOnItemsRenderedProps & {
  type: "onItemsRendered";
};

export type UpdateAction = Partial<TimelineState> & {
  type: "update";
};

export function useTimelineReducer(
  state: TimelineState,
  { type, ...action }: Action
): TimelineState {
  let newState = { ...state, ...action };

  let shouldUpdateColumns = false;
  let shouldUpdateItems = false;
  let shouldUpdateRows = false;

  switch (type) {
    case "update":
      if (
        newState.startTime !== state.startTime ||
        newState.endTime !== state.endTime ||
        newState.paddingLeft !== state.paddingLeft ||
        newState.intervalWidth !== state.intervalWidth ||
        newState.visualIntervalDuration !== state.visualIntervalDuration
      ) {
        shouldUpdateColumns = true;
        shouldUpdateItems = true;
      }

      if (
        newState.originalHierarchy !== state.originalHierarchy ||
        newState.expandedNodeIds !== state.expandedNodeIds
      ) {
        newState = newHierarchyRecord(newState);

        shouldUpdateItems = true;
      }

      if (
        shouldUpdateItems ||
        newState.originalItems !== state.originalItems ||
        newState.intervalDuration !== state.intervalDuration
      ) {
        newState = newGroupedItems(newState);
        shouldUpdateRows = true;
      }

      if (
        shouldUpdateRows ||
        newState.estimatedRowHeight !== state.estimatedRowHeight ||
        newState.itemHeight !== state.itemHeight ||
        newState.minRowHeight !== state.minRowHeight ||
        newState.rowVerticalPadding !== state.rowVerticalPadding
      ) {
        newState = newRows(newState);

        newState = newVisibleItems(newState);
        newState = newVisibleRows(newState);
      }

      if (shouldUpdateColumns) {
        newState = newVisibleColumns(newState);
      }

      return newState;
    case "onItemsRendered":
      if (
        newState.overscanRowStartIndex !== state.overscanRowStartIndex ||
        newState.overscanRowStopIndex !== state.overscanRowStopIndex
      ) {
        newState = newVisibleRows(newState);
      }

      if (
        newState.overscanColumnStartIndex !== state.overscanColumnStartIndex ||
        newState.overscanColumnStopIndex !== state.overscanColumnStopIndex
      ) {
        newState = newVisibleColumns(newState);
      }

      newState = newVisibleItems(newState);

      return newState;
    default:
      throw new Error("Invalid action");
  }
}

export function useTimelineReducerInitial(action: UpdateAction): TimelineState {
  return useTimelineReducer(
    {
      rows: [],
      allRows: [],
      rowOffsets: [],
      itemOffsetCache: new WeakMap(),

      items: [],
      groupedItems: [],
      itemsInViewCache: {},

      hierarchyRecord: {},

      hierarchy: [],

      allColumns: [],
      columns: [],

      overscanColumnStartIndex: -1,
      overscanColumnStopIndex: -1,
      overscanRowStartIndex: -1,
      overscanRowStopIndex: -1,

      originalHierarchy: [],
      originalItems: [],
      expandedNodeIds: [],

      startTime: 0,
      endTime: 0,
      itemHeight: 0,
      minItemWidth: 0,

      minRowHeight: 0,
      rowVerticalPadding: 0,
      estimatedRowHeight: 0,

      paddingLeft: 0,
      paddingTop: 0,

      intervalWidth: 1,
      intervalDuration: 1,
      visualIntervalDuration: 1,
    },
    action
  );
}
