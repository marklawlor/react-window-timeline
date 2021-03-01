import { Group, Item, ItemMap, MappedItem, RowMap } from './timeline-data';

export interface RowOptions {
  group: Group;
  index: number;
  intervals: number[];
  itemHeight: number;
  itemMap: ItemMap;
  rowMap: RowMap<any>;
  timebarHeight: number;
  minGroupHeight: number;
  groupTopPadding: number;
  groupBottomPadding: number;
}

export default class Row<T extends Item = Item> {
  group: Group;
  index: number;

  intervals: number[];
  itemHeight: number;
  itemIds: Set<Item['id']> = new Set();
  itemMap: ItemMap;
  rowMap: RowMap<any>;
  timebarHeight: number;
  minGroupHeight: number;
  groupTopPadding: number;
  groupBottomPadding: number;

  private offsets: Record<string, number> = {};

  private _height: number | undefined;

  constructor({
    group,
    index,
    intervals,
    itemHeight,
    itemMap,
    rowMap,
    timebarHeight,
    minGroupHeight,
    groupTopPadding,
    groupBottomPadding,
  }: RowOptions) {
    this.group = group;
    this.index = index;
    this.intervals = intervals;
    this.itemHeight = itemHeight;
    this.itemMap = itemMap;
    this.rowMap = rowMap;
    this.timebarHeight = timebarHeight;
    this.minGroupHeight = minGroupHeight;

    this.groupTopPadding = groupTopPadding;
    this.groupBottomPadding = groupBottomPadding;
  }

  get height(): number {
    if (this._height === undefined) {
      this.recalculate();
    }

    return this._height as number;
  }

  get top(): number {
    const previousRow = this.rowMap.get(this.index - 1)!;

    if (!previousRow) {
      return 0; //this.timebarHeight;
    }

    return previousRow.top + previousRow.height;
  }

  get bottom(): number {
    return this.height + this.top;
  }

  recalculate() {
    this.offsets = {};

    const sortedItems = this.items.sort((a, b) => {
      if (a.start === b.start) {
        return a.end - b.end;
      }

      return a.start - b.start;
    });

    let rowOffset = 0;

    // Loop until everything has been calculated
    while (sortedItems.length > 0) {
      let lastEnd = null;
      // Find all items that do not overlap
      for (let index = 0; index < sortedItems.length; index++) {
        const item = sortedItems[index];
        // This item does not overlap with the last
        if (lastEnd === null || item.start > lastEnd) {
          // Therefore it can have the same rowOffset
          this.offsets[item.id] = rowOffset;
          // Remove this item as it has been processed
          sortedItems.splice(index, 1);
          // Keep the index in place, as we modified the array
          index--;
          // The next item needs to check against this one
          lastEnd = item.end;
        }
      }
      // All the remaining items overlapped with something, so increase the rowOffset
      // We will also reset the lastEnd when we start looping again
      rowOffset++;
    }

    const height =
      this.groupTopPadding +
      Math.max(rowOffset, 1) * this.itemHeight +
      this.groupBottomPadding;

    this._height = Math.max(this.minGroupHeight, height);
  }

  get items() {
    return Array.from(this.itemIds).map(id => this.itemMap.get(id)!);
  }

  addItem(item: Item) {
    this.itemIds.add(item.id);
    // Force the height be be recalculated
    this._height = undefined;
  }

  removeItem(item: T): void {
    this.itemIds.delete(item.id);
    // Force the height be be recalculated
    this._height = undefined;
  }

  getItemTopOffset(item: T, itemHeight: number): number {
    return this.offsets[item.id as T['id']] * itemHeight + this.groupTopPadding;
  }

  getItemsByIntervalRange(startIndex: number, endIndex: number): MappedItem[] {
    const start = this.intervals[startIndex];
    const end = this.intervals[endIndex];

    return this.items.filter(item => {
      return item.end > start && item.start < end;
    });
  }
}
