import {
  createContext,
  CSSProperties,
  FC,
  ReactElement,
  RefObject,
} from 'react';
import { VariableSizeGridProps } from 'react-window';

import { Group, Item, ItemMap, RowMap } from './timeline-data';

export interface ItemRendererProps<T extends Item = Item> {
  item: T;
  style: CSSProperties;
}
export type ItemRenderer<T extends Item = Item> = FC<ItemRendererProps<T>>;

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

export interface SidebarRendererProps {
  style: CSSProperties;
}
export type SidebarRenderer = FC<SidebarRendererProps>;

export type UpsertItem<T extends Item = Item> = (item: T) => void;

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
  ItemRenderer: ItemRenderer<any>;
  RowRenderer?: RowRenderer<any>;
  SidebarHeaderRenderer: SidebarHeaderRenderer;
  SidebarRenderer: SidebarRenderer;
  TimebarHeaderRenderer?: TimebarHeaderRenderer;
  TimebarIntervalRenderer?: TimebarIntervalRenderer;
  children?: ReactElement | null;
  columnCount: number;
  columnWidth: VariableSizeGridProps['columnWidth'];
  endTime: number;
  getValuesToUpdate: GetValuesToUpdate;
  groups: Group[];
  height: number;
  intervalDuration: number;
  intervalWidth: number;
  intervals: number[];
  itemData: any;
  itemHeight: number;
  itemMap: ItemMap;
  minItemWidth: number;
  outerRef: RefObject<HTMLDivElement>;
  overscanColumnStartIndex: number;
  overscanColumnStopIndex: number;
  overscanRowStartIndex: number;
  overscanRowStopIndex: number;
  rowCount: number;
  rowHeight: VariableSizeGridProps['rowHeight'];
  rowMap: RowMap<Item>;
  setStickyItemIds: (items: Array<Item['id']>) => void;
  sidebarWidth: number;
  snapDuration: number;
  startTime: number;
  stickyItemIds: Array<Item['id']>;
  timebarHeaderHeight: number;
  timebarHeight: number;
  timebarIntervalHeight: number;
  upsertItem: UpsertItem;
  visibleColumnStartIndex: number;
  visibleColumnStopIndex: number;
  visibleRowStartIndex: number;
  visibleRowStopIndex: number;
  width: number;
}

const TimelineContext = createContext<TimelineContextValue>({
  GroupRenderer: () => null,
  ItemRenderer: () => null,
  SidebarHeaderRenderer: () => null,
  SidebarRenderer: () => null,
  TimebarHeaderRenderer: () => null,
  TimebarIntervalRenderer: () => null,
  columnCount: 0,
  columnWidth: () => 0,
  endTime: 0,
  getValuesToUpdate: () => null,
  groups: [],
  height: 0,
  intervalDuration: 0,
  intervalWidth: 0,
  intervals: [],
  itemData: {},
  itemHeight: 0,
  itemMap: new Map(),
  minItemWidth: 0,
  outerRef: { current: null },
  overscanColumnStartIndex: 0,
  overscanColumnStopIndex: 0,
  overscanRowStartIndex: 0,
  overscanRowStopIndex: 0,
  rowCount: 0,
  rowHeight: () => 0,
  rowMap: new Map(),
  setStickyItemIds: () => undefined,
  sidebarWidth: 0,
  snapDuration: 0,
  startTime: 0,
  stickyItemIds: [],
  timebarHeaderHeight: 0,
  timebarHeight: 0,
  timebarIntervalHeight: 0,
  upsertItem: () => undefined,
  visibleColumnStartIndex: 0,
  visibleColumnStopIndex: 0,
  visibleRowStartIndex: 0,
  visibleRowStopIndex: 0,
  width: 0,
});

TimelineContext.displayName = 'TimelineContext';

export default TimelineContext;
