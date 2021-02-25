import { Group, Item, MappedItem, RowMap } from './timeline-data';
import { snapTime } from './utils/time';

export interface RowOptions {
  index: number;
  group: Group;
  intervals: number[];
  rowMap: RowMap<any>;
  itemHeight: number;
  timebarHeight: number;
  snapDuration: number;
}

export default class Row<T extends Item = Item> {
  group: Group;
  index: number;

  intervals: number[];
  itemHeight: number;
  items: MappedItem<T>[] = [];
  rowMap: RowMap<any>;
  timebarHeight: number;
  snapDuration: number;

  private offsets: Record<string, number> = {};

  private _height: number | undefined;

  constructor({
    group,
    index,
    intervals,
    itemHeight,
    rowMap,
    snapDuration,
    timebarHeight,
  }: RowOptions) {
    this.group = group;
    this.index = index;
    this.intervals = intervals;
    this.itemHeight = itemHeight;
    this.rowMap = rowMap;
    this.timebarHeight = timebarHeight;
    this.snapDuration = snapDuration;
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
      return this.timebarHeight;
    }

    return previousRow.top + previousRow.height;
  }

  get bottom(): number {
    return this.height + this.top;
  }

  addItem(item: MappedItem<T>) {
    this.items.push(item);
  }

  recalculate() {
    this.offsets = {};

    const sortedItems = Array.from(
      this.items.sort((a, b) => {
        if (a.start === b.start) {
          return a.end - b.end;
        }

        return a.start - b.start;
      })
    );

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

    this._height = Math.max(rowOffset, 1) * this.itemHeight;
  }

  upsertItem(item: T): void {
    let index = this.items.findIndex(({ id }) => id === item.id);

    if (index === -1) {
      this.items.push({
        ...item,
        groupId: this.group.id,
        start: snapTime(item.start, this.snapDuration),
        end: snapTime(item.end, this.snapDuration),
        row: this,
      });
    } else {
      this.items.splice(index, 1, {
        ...item,
        groupId: this.group.id,
        start: snapTime(item.start, this.snapDuration),
        end: snapTime(item.end, this.snapDuration),
        row: this,
      });
    }

    // Force the height be be recalculated
    this._height = undefined;
  }

  removeItem(item: T): void {
    const index = this.items.findIndex(({ id }) => id === item.id);

    if (index === -1) {
      throw new Error('Unable to find item');
    }

    this.items.splice(index, 1);

    // Force the height be be recalculated
    this._height = undefined;
  }

  getItemTopOffset(item: T, itemHeight: number): number {
    return this.offsets[item.id as T['id']] * itemHeight;
  }

  getItemsByIntervalRange(
    startIndex: number,
    endIndex: number
  ): MappedItem<T>[] {
    const start = this.intervals[startIndex];
    const end = this.intervals[endIndex];

    return this.items.filter(item => {
      return item.end > start && item.start < end;
    });
  }
}
