// import { DataNode, Item, TimelineInterval } from "./interfaces";

// export interface RowConstructorOptions {
//   items: Set<Item>;

//   leafNodeId: DataNode["id"];
//   index: number;

//   itemHeight: number;
//   previousRow: Row | undefined;

//   timelinePaddingTop: number;
//   minGroupHeight: number;
//   groupTopPadding: number;
//   groupBottomPadding: number;
// }

// export class Row {
//   itemHeight: number;
//   timelinePaddingTop: number;
//   minGroupHeight: number;
//   groupTopPadding: number;
//   groupBottomPadding: number;

//   private offsets: Record<string, number> = {};

//   private _height: number | undefined;
//   private previousRow: Row | undefined;

//   public items: Set<Item>;
//   public leafNodeId: DataNode["id"];
//   public index: number;

//   public key: string;

//   constructor({
//     items,
//     index,
//     leafNodeId,
//     itemHeight,
//     previousRow,
//     timelinePaddingTop,
//     minGroupHeight,
//     groupTopPadding,
//     groupBottomPadding,
//   }: RowConstructorOptions) {
//     this.key = `row:${index}`;
//     this.items = items;
//     this.index = index;
//     this.leafNodeId = leafNodeId;
//     this.itemHeight = itemHeight;
//     this.previousRow = previousRow;
//     this.timelinePaddingTop = timelinePaddingTop;
//     this.minGroupHeight = minGroupHeight;

//     this.groupTopPadding = groupTopPadding;
//     this.groupBottomPadding = groupBottomPadding;
//   }

//   get height(): number {
//     if (this._height === undefined) {
//       this.recalculate();
//     }

//     return this._height as number;
//   }

//   resetHeightCalc() {
//     this._height = undefined;
//   }

//   get top(): number {
//     if (this._height === undefined) {
//       this.recalculate();
//     }

//     if (!this.previousRow) {
//       return this.timelinePaddingTop || 0;
//     }

//     return this.previousRow.top + this.previousRow.height;
//   }

//   get bottom(): number {
//     return this.height + this.top;
//   }

//   recalculate() {
//     this.offsets = {};

//     const sortedItems = Array.from(this.items).sort((a, b) => {
//       if (a.start === b.start) {
//         return a.end - b.end;
//       }

//       return a.start - b.start;
//     });

//     let rowOffset = 0;

//     // Loop until everything has been calculated
//     while (sortedItems.length > 0) {
//       let lastEnd = null;
//       // Find all items that do not overlap
//       for (let index = 0; index < sortedItems.length; index++) {
//         const item = sortedItems[index];
//         // This item does not overlap with the last
//         if (lastEnd === null || item.start > lastEnd) {
//           // Therefore it can have the same rowOffset
//           this.offsets[item.id] = rowOffset;
//           // Remove this item as it has been processed
//           sortedItems.splice(index, 1);
//           // Keep the index in place, as we modified the array
//           index--;
//           // The next item needs to check against this one
//           lastEnd = item.end;
//         }
//       }
//       // All the remaining items overlapped with something, so increase the rowOffset
//       // We will also reset the lastEnd when we start looping again
//       rowOffset++;
//     }

//     const firstRowPadding = this.index === 0 ? this.timelinePaddingTop : 0;

//     const height =
//       firstRowPadding +
//       this.groupTopPadding +
//       Math.max(rowOffset, 1) * this.itemHeight +
//       this.groupBottomPadding;

//     this._height = Math.max(this.minGroupHeight, height);
//   }

//   addItem(item: Item) {
//     this.items.add(item);
//     this.resetHeightCalc();
//   }

//   removeItem(item: Item): void {
//     this.items.delete(item);
//     this.resetHeightCalc();
//   }

//   getItemTopOffset(item: Item, itemHeight: number): number {
//     return (
//       this.offsets[item.id as Item["id"]] * itemHeight + this.groupTopPadding
//     );
//   }

//   getItemsByIds(ids: Item["id"][]) {
//     return Array.from(this.items).flatMap((item) => {
//       if (!ids.includes(item.id)) {
//         return [];
//       }

//       return item;
//     });
//   }

//   getItemsByIntervalRange(
//     startIndex: number,
//     endIndex: number,
//     intervals: TimelineInterval[]
//   ): Item[] {
//     const start = intervals[startIndex].interval;
//     const end = intervals[endIndex].interval;

//     return Array.from(this.items).filter((item) => {
//       return item.end > start && item.start < end;
//     });
//   }
// }
