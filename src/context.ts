import { createContext, CSSProperties, FC, RefObject } from 'react';
import { GridOnItemsRenderedProps, VariableSizeGridProps } from 'react-window';

import { Group, Item, RowMap } from './timeline-data';

export interface ItemRenderProps<T extends Item = Item> {
  item: T;
  style: CSSProperties;
}
export type ItemRenderer<T extends Item = Item> = FC<ItemRenderProps<T>>;

export interface GroupRendererProps<T extends Group = Group> {
  group: T;
  rowIndex: number;
  isOdd: boolean;
  isEven: boolean;
  style: CSSProperties;
}
export type GroupRenderer<T extends Group = Group> = FC<GroupRendererProps<T>>;

export interface TimebarIntervalRendererProps {
  time: number;
  isOdd: boolean;
  isEven: boolean;
  style: CSSProperties;
}
export type TimebarIntervalRenderer = FC<TimebarIntervalRendererProps>;

export type RowRendererProps<T extends Group = Group> = GroupRendererProps<T>;
export type RowRenderer<T extends Group = Group> = FC<GroupRendererProps<T>>;

export type ColumnRendererProps = TimebarIntervalRendererProps;
export type ColumnRenderer = TimebarIntervalRenderer;

export interface TimebarHeaderProps {
  style: CSSProperties;
}
export type TimebarHeaderRenderer = FC<TimebarHeaderProps>;

export interface SidebarHeaderRendererProps {
  style: CSSProperties;
}
export type SidebarHeaderRenderer = FC<SidebarHeaderRendererProps>;

export type UpdateItem<T extends Item = Item> = (item: T) => void;

export enum UpdateItemAction {
  MOVE,
  RESIZE,
}

export interface TimelineContextValue {
  columnCount: number;
  columnWidth: VariableSizeGridProps['columnWidth'];
  getValuesToUpdate: (
    event: MouseEvent & { target: HTMLElement },
    action?: UpdateItemAction
  ) => null | {
    start: number;
    end: number;
    groupId?: string;
  };
  intervals: number[];
  intervalDuration: number;
  intervalWidth: number;
  itemData: any;
  itemHeight: number;
  itemRenderer: ItemRenderer<any>;
  groupRenderer: GroupRenderer<any>;
  timebarIntervalRenderer: TimebarIntervalRenderer;
  timebarHeaderRenderer: TimebarHeaderRenderer;
  minItemWidth: number;
  groups: Group[];
  rowCount: number;
  rowHeight: VariableSizeGridProps['rowHeight'];
  rowMap: RowMap<Item>;
  sidebarWidth: number;
  startDate: Date;
  startTime: number;
  timebarHeight: number;
  timebarHeaderHeight: number;
  timebarIntervalHeight: number;
  rowRenderer?: RowRenderer<any>;
  columnRenderer?: ColumnRenderer;
  sidebarHeaderRenderer: SidebarHeaderRenderer;
  updateItem: UpdateItem;
  visibleArea: GridOnItemsRenderedProps;
  width: number;
  height: number;
  outerRef: RefObject<HTMLDivElement>;
}

const TimelineContext = createContext<TimelineContextValue>({
  columnCount: 0,
  columnWidth: () => 0,
  getValuesToUpdate: () => null,
  intervals: [],
  intervalDuration: 0,
  intervalWidth: 0,
  itemData: {},
  itemHeight: 0,
  groups: [],
  itemRenderer: () => null,
  groupRenderer: () => null,
  timebarIntervalRenderer: () => null,
  timebarHeaderRenderer: () => null,
  minItemWidth: 0,
  rowCount: 0,
  rowHeight: () => 0,
  rowMap: new Map(),
  sidebarWidth: 0,
  startDate: new Date(0),
  startTime: 0,
  timebarHeight: 0,
  timebarHeaderHeight: 0,
  timebarIntervalHeight: 0,
  height: 0,
  updateItem: () => undefined,
  sidebarHeaderRenderer: () => null,
  width: 0,
  outerRef: { current: null },
  visibleArea: {
    overscanColumnStartIndex: 0,
    overscanColumnStopIndex: 0,
    overscanRowStartIndex: 0,
    overscanRowStopIndex: 0,
    visibleColumnStartIndex: 0,
    visibleColumnStopIndex: 0,
    visibleRowStartIndex: 0,
    visibleRowStopIndex: 0,
  },
});

TimelineContext.displayName = 'TimelineContext';

export default TimelineContext;
