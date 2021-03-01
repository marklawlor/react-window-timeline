import React, {
  createContext,
  CSSProperties,
  FC,
  ForwardedRef,
  ForwardRefRenderFunction,
  ReactElement,
  RefObject,
} from 'react';
import { VariableSizeGridProps } from 'react-window';

import { Group, Item, ItemMap, RowMap } from './timeline-data';

export type BodyRenderer = ForwardRefRenderFunction<
  HTMLElement,
  BodyRendererProps
>;

export interface BodyRendererProps {
  style: CSSProperties;
  ref: ForwardedRef<HTMLElement>;
}

export type ItemRenderer<T extends Item = Item> = FC<ItemRendererProps<T>>;
export interface ItemRendererProps<T extends Item = Item> {
  item: T;
  style: CSSProperties;
}

export type GroupRenderer<T extends Group = Group> = FC<GroupRendererProps<T>>;
export interface GroupRendererProps<T extends Group = Group> {
  group: T;
  rowIndex: number;
  isOdd: boolean;
  isEven: boolean;
  style: CSSProperties;
}

export type TimebarIntervalRenderer = FC<TimebarIntervalRendererProps>;
export interface TimebarIntervalRendererProps {
  time: number;
  isOdd: boolean;
  isEven: boolean;
  style: CSSProperties;
}

export type RowRenderer<T extends Group = Group> = FC<GroupRendererProps<T>>;
export type RowRendererProps<T extends Group = Group> = GroupRendererProps<T>;

export type ColumnRenderer = TimebarIntervalRenderer;
export type ColumnRendererProps = TimebarIntervalRendererProps;

export type TimebarHeaderRenderer = FC<TimebarHeaderProps>;
export interface TimebarHeaderProps {
  style: CSSProperties;
}

export type SidebarHeaderRenderer = FC<SidebarHeaderRendererProps>;
export interface SidebarHeaderRendererProps {
  style: CSSProperties;
}

export type SidebarRenderer = FC<SidebarRendererProps>;
export interface SidebarRendererProps {
  style: CSSProperties;
}

export type UpsertItem<T extends Item = Item> = (item: T) => void;

export enum UpdateItemAction {
  MOVE,
  RESIZE,
}

export type GetItemFromAction = (
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  action?: UpdateItemAction
) => null | {
  start: number;
  end: number;
  groupId?: string;
};

export type GetItemAtCursor = (
  event: React.MouseEvent<HTMLElement, MouseEvent>
) => null | {
  start: number;
  end: number;
  groupId?: string;
};

export interface TimelineContextValue {
  BodyRenderer: BodyRenderer;
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
  getItemFromAction: GetItemFromAction;
  getItemAtCursor: GetItemAtCursor;
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
  BodyRenderer: () => null,
  SidebarHeaderRenderer: () => null,
  SidebarRenderer: () => null,
  TimebarHeaderRenderer: () => null,
  TimebarIntervalRenderer: () => null,
  columnCount: 0,
  columnWidth: () => 0,
  endTime: 0,
  getItemFromAction: () => null,
  getItemAtCursor: () => null,
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
