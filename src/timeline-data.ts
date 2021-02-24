import Row from './row';
import { snapTime } from './utils/time';

export interface Group {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  groupId: string;
  start: number;
  end: number;
}

export type MappedItem<T extends Item> = T & { row: Row<T> };

type ItemMap<T extends Item> = Map<string, MappedItem<T>>;

export type RowMap<T extends Item> = Map<number, Row<T>>;

export interface MapTimelineDateOptions<T extends Item> {
  groups: Group[];
  intervals: number[];
  items: T[];
  itemHeight: number;
  timebarHeight: number;
  snapDuration: number;
}

export function getTimelineData<T extends Item>({
  groups,
  intervals,
  itemHeight,
  items,
  snapDuration,
  timebarHeight,
}: MapTimelineDateOptions<T>): [ItemMap<T>, RowMap<T>] {
  const itemMap: ItemMap<T> = new Map();
  const rowMap: RowMap<T> = new Map();
  const groupMap: Record<string, Row<T>> = {};

  const rows: Row<T>[] = [];

  for (const [index, group] of groups.entries()) {
    const row = new Row<T>({
      group,
      index,
      intervals,
      itemHeight,
      rowMap,
      snapDuration,
      timebarHeight,
    });

    rows.push(row);
    rowMap.set(row.index, row);
    groupMap[group.id] = row;
  }

  for (const item of items) {
    const row = groupMap[item.groupId];

    if (row === undefined) {
      throw new Error('Item has mismatched group id');
    }

    const mappedItem = {
      ...item,
      row,
      start: snapTime(item.start, snapDuration),
      end: snapTime(item.end, snapDuration),
    };

    row.addItem(mappedItem);
    itemMap.set(item.id, mappedItem);
  }

  return [itemMap, rowMap];
}

export function getUnmappedItem<T extends Item>({
  row,
  ...item
}: MappedItem<T>): T {
  return (item as unknown) as T;
}
