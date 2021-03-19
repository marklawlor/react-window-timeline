import Row from './row';
import { snapTime } from './utils/time';

export interface Collection {
  name: string;
  groups: Group[];
}

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

export type MappedItem<T extends Item = Item> = T & { row: Row<T> };

export type ItemMap<T extends Item = Item> = Map<string, MappedItem<T>>;

export type RowMap<T extends Item> = Map<number, Row<T>>;

export type RowCollection<T extends Item> = {
  index: number;
  name: string;
  rows: Array<Row<T>>;
};

export interface MapTimelineDateOptions<T extends Item> {
  collections: Collection[];
  intervals: number[];
  items: T[];
  itemHeight: number;
  timebarHeight: number;
  snapDuration: number;
  minGroupHeight: number;
  groupTopPadding: number;
  groupBottomPadding: number;
}

export function getTimelineData<T extends Item>({
  collections,
  intervals,
  itemHeight,
  items,
  snapDuration,
  timebarHeight,
  minGroupHeight,
  groupTopPadding,
  groupBottomPadding,
}: MapTimelineDateOptions<T>): [ItemMap<T>, RowMap<T>] {
  const itemMap: ItemMap<T> = new Map();
  const rowMap: RowMap<T> = new Map();

  const groupMap: Record<string, Row<T>> = {};

  let rowCounter = 0;

  for (const [index, { groups, name }] of collections.entries()) {
    const collection: RowCollection<T> = {
      index,
      name,
      rows: [],
    };

    for (const group of groups.values()) {
      const row = new Row<T>({
        group,
        collection,
        index: rowCounter++,
        intervals,
        itemHeight,
        itemMap,
        rowMap,
        timebarHeight,
        minGroupHeight,
        groupTopPadding,
        groupBottomPadding,
      });

      collection.rows.push(row);
      rowMap.set(row.index, row);
      groupMap[group.id] = row;
    }
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
