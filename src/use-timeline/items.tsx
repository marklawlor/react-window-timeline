import { Item, TimelineItem } from "../interfaces";
import { getPositionAtTime } from "../utils/time";
import { TimelineState } from "./use-timeline-reducer";

export function newGroupedItems(state: TimelineState): TimelineState {
  const { hierarchyRecord, startTime, originalItems, intervalDuration } = state;

  const groupedItems: TimelineState["groupedItems"] = [];

  for (const itemOrTimelineItem of originalItems) {
    const item = isTimelineItem(itemOrTimelineItem)
      ? itemOrTimelineItem.item
      : itemOrTimelineItem;

    const leafIndex = hierarchyRecord[item.nodeId].leafIndex;

    groupedItems[leafIndex] = groupedItems[leafIndex] || [];
    const groupedItemsLeaf = groupedItems[leafIndex];

    for (
      let currentTime = item.start;
      currentTime < item.end;
      currentTime += intervalDuration
    ) {
      const interval = Math.floor((currentTime - startTime) / intervalDuration);

      groupedItemsLeaf[interval] = groupedItemsLeaf[interval] || [];
      groupedItemsLeaf[interval].push(item);
    }
  }

  return {
    ...state,
    groupedItems,
    itemsInViewCache: {},
  };
}

function getRowItemsInView(rowIndex: number, state: TimelineState) {
  const {
    itemsInViewCache,
    overscanColumnStartIndex,
    overscanColumnStopIndex,
    groupedItems,
    allRows,
    hierarchyRecord,

    minItemWidth,
    itemHeight,

    startTime,
    intervalDuration,
    visualIntervalDuration,
    intervalWidth,
    paddingLeft,
    paddingTop,
    rowVerticalPadding,
  } = state;

  const intervalRatio = visualIntervalDuration / intervalDuration;
  const visualOverscanColumnStartIndex = Math.floor(
    overscanColumnStartIndex * intervalRatio
  );

  const visualOverscanColumnStopIndex = Math.floor(
    overscanColumnStopIndex * intervalRatio
  );

  const cacheKey = `${rowIndex}-${visualOverscanColumnStartIndex}-${visualOverscanColumnStopIndex}`;

  if (!groupedItems[rowIndex]) {
    return { items: [], maxOffset: 0 };
  }

  /* if (itemsInViewCache[cacheKey]) { */
  /*   return itemsInViewCache[cacheKey]; */
  /* } */

  let unsortedItems = new Set<Item>();

  for (
    let column = visualOverscanColumnStartIndex;
    column <= visualOverscanColumnStopIndex;
    column++
  ) {
    const columItems = groupedItems[rowIndex][column] || [];
    columItems.forEach((item) => {
      unsortedItems.add(item);
    });
  }

  const chronologicalItems = Array.from(unsortedItems).sort((a, b) => {
    if (a.start === b.start) {
      return a.end - b.end;
    }

    return a.start - b.start;
  });

  const timelineItems: TimelineItem[] = [];

  let offset = 0;

  while (chronologicalItems.length > 0) {
    let lastEnd = null;
    // Find all items that do not overlap
    for (let index = 0; index < chronologicalItems.length; index++) {
      const item = chronologicalItems[index];
      // This item does not overlap with the last
      if (lastEnd === null || item.start > lastEnd) {
        // Remove this item as it has been processed
        chronologicalItems.splice(index, 1);
        // Keep the index in place, as we modified the array
        index--;
        // The next item needs to check against this one
        lastEnd = item.end;

        // Now we know its offset, we can create the TimelineItem
        const left = getPositionAtTime(
          item.start,
          startTime,
          visualIntervalDuration,
          intervalWidth,
          paddingLeft
        );

        const width = Math.max(
          getPositionAtTime(
            item.end,
            startTime,
            visualIntervalDuration,
            intervalWidth,
            paddingLeft
          ) - left,
          minItemWidth
        );

        const timelineItem: TimelineItem = {
          id: item.id,
          key: `item:${item.id}`,
          height: itemHeight,
          item,
          left,
          width,
          offset,
          rowIndex: hierarchyRecord[item.nodeId].leafIndex,
          get top() {
            return (
              allRows[this.rowIndex].top +
              paddingTop +
              rowVerticalPadding +
              this.offset * itemHeight
            );
          },
        };

        timelineItems.push(timelineItem);
      }
    }

    offset++;
  }

  const itemsInKeyOrder = timelineItems.sort((a, b) => {
    return a.key.localeCompare(b.key);
  });

  itemsInViewCache[cacheKey] = {
    items: itemsInKeyOrder,
    maxOffset: offset,
  };

  return itemsInViewCache[cacheKey];
}

export function newVisibleItems(state: TimelineState): TimelineState {
  const { overscanRowStartIndex, overscanRowStopIndex, rowOffsets } = state;

  let items: TimelineItem[] = [];

  let shouldReset = false;

  for (
    let index = overscanRowStartIndex;
    index <= overscanRowStopIndex;
    index++
  ) {
    const { items: rowItems, maxOffset } = getRowItemsInView(index, state);

    // The height of this row has changed, so we need to reset
    if (rowOffsets[index] !== maxOffset) {
      rowOffsets[index] = maxOffset;
      shouldReset = true;
    }

    items = [...items, ...rowItems];
  }

  if (shouldReset) {
    console.log("should reset");
  }

  return {
    ...state,
    items,
  };
}

function isTimelineItem(item: TimelineItem | Item): item is TimelineItem {
  return "item" in item;
}
