import { createContext, CSSProperties, FC, RefObject } from 'react';
import { VariableSizeGridProps } from 'react-window';

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

export type GetValuesToUpdate = (
  event: MouseEvent & { target: HTMLElement },
  action?: UpdateItemAction
) => null | {
  start: number;
  end: number;
  groupId?: string;
};

export interface TimelineContextValue {
  ColumnRenderer?: ColumnRenderer;
  GroupRenderer?: GroupRenderer<any>;
  RowRenderer?: RowRenderer<any>;
  TimebarHeaderRenderer?: TimebarHeaderRenderer;
  TimebarIntervalRenderer?: TimebarIntervalRenderer;
  columnCount: number;
  columnWidth: VariableSizeGridProps['columnWidth'];
  endDate: Date;
  endTime: number;
  getValuesToUpdate: GetValuesToUpdate;
  groups: Group[];
  height: number;
  intervalDuration: number;
  intervalWidth: number;
  intervals: number[];
  itemData: any;
  itemHeight: number;
  itemRenderer: ItemRenderer<any>;
  minItemWidth: number;
  outerRef: RefObject<HTMLDivElement>;
  overscanColumnStartIndex: number;
  overscanColumnStopIndex: number;
  overscanRowStartIndex: number;
  overscanRowStopIndex: number;
  rowCount: number;
  rowHeight: VariableSizeGridProps['rowHeight'];
  rowMap: RowMap<Item>;
  SidebarHeaderRenderer: SidebarHeaderRenderer;
  sidebarWidth: number;
  snapDuration: number;
  startDate: Date;
  startTime: number;
  timebarHeaderHeight: number;
  timebarHeight: number;
  timebarIntervalHeight: number;
  updateItem: UpdateItem;
  visibleColumnStartIndex: number;
  visibleColumnStopIndex: number;
  visibleRowStartIndex: number;
  visibleRowStopIndex: number;
  width: number;
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
  snapDuration: 0,
  itemRenderer: () => null,
  GroupRenderer: () => null,
  TimebarIntervalRenderer: () => null,
  TimebarHeaderRenderer: () => null,
  minItemWidth: 0,
  rowCount: 0,
  rowHeight: () => 0,
  rowMap: new Map(),
  sidebarWidth: 0,
  startDate: new Date(0),
  startTime: 0,
  endDate: new Date(0),
  endTime: 0,
  timebarHeight: 0,
  timebarHeaderHeight: 0,
  timebarIntervalHeight: 0,
  height: 0,
  updateItem: () => undefined,
  SidebarHeaderRenderer: () => null,
  width: 0,
  outerRef: { current: null },
  overscanColumnStartIndex: 0,
  overscanColumnStopIndex: 0,
  overscanRowStartIndex: 0,
  overscanRowStopIndex: 0,
  visibleColumnStartIndex: 0,
  visibleColumnStopIndex: 0,
  visibleRowStartIndex: 0,
  visibleRowStopIndex: 0,
});

TimelineContext.displayName = 'TimelineContext';

export default TimelineContext;
