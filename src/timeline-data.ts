import Row from './row';
import { snapTime } from './utils/time';

export interface ParentGroup {
  name: string;
  groups: ChildGroup[];
  [index: string]: any;
}

export interface ChildGroup {
  id: string;
  name: string;
  [index: string]: any;
}

export interface Item {
  id: string;
  groupId: string;
  start: number;
  end: number;
}

export type MappedItem = Item & { row: Row };

export type ItemMap = Map<string, MappedItem>;

export type RowMap = Map<number, Row>;

export type RowCollection = {
  index: number;
  name: string;
  rows: Array<Row>;
};

export interface MapTimelineDateOptions {
  groups: ParentGroup[] | ChildGroup[];
  intervals: number[];
  items: Item[];
  itemHeight: number;
  timebarHeight: number;
  snapDuration: number;
  minGroupHeight: number;
  groupTopPadding: number;
  groupBottomPadding: number;
}

function isParentGroup(group: ParentGroup | ChildGroup): group is ParentGroup {
  return 'groups' in group;
}

export function getTimelineData({
  groups,
  intervals,
  itemHeight,
  items,
  snapDuration,
  timebarHeight,
  minGroupHeight,
  groupTopPadding,
  groupBottomPadding,
}: MapTimelineDateOptions): [ItemMap, RowMap] {
  const itemMap: ItemMap = new Map();
  const rowMap: RowMap = new Map();

  const groupMap: Record<string, Row> = {};

  let rowCounter = 0;

  for (const [index, group] of groups.entries()) {
    const groupArray = isParentGroup(group) ? group.groups : [group];

    const collection: RowCollection = {
      ...group,
      index,
      name: group.name,
      rows: [],
    };

    for (const group of groupArray) {
      const row = new Row({
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

export function getUnmappedItem({ row, ...item }: MappedItem): Item {
  return item;
}
