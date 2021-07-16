import { TimelineRow } from "../interfaces";
import { buildVisibleHierarchy } from "./hierarchy";
import { TimelineState } from "./use-timeline-reducer";

export function newRows(state: TimelineState): TimelineState {
  const {
    originalHierarchy,
    hierarchyRecord,
    groupedItems,
    rowOffsets,
    estimatedRowHeight,
    itemHeight,
    minRowHeight,
    rowVerticalPadding,
  } = state;

  let index = 0;

  const allRows = Object.values(hierarchyRecord).flatMap((hierarchy) => {
    if (!hierarchy.isLeaf) {
      return [];
    }

    const row: TimelineRow = {
      id: hierarchy.id,
      key: `row-${hierarchy.id}`,
      index: index++,
      get top() {
        if (this.index === 0) return 0;

        // If this hasn't been calculated yet, use the estimate
        if (rowOffsets[this.index - 1] === undefined) {
          return this.index * estimatedRowHeight;
        }

        return allRows[this.index - 1].top + allRows[this.index - 1].height;
      },
      get height() {
        const maxOffset = rowOffsets[this.index];
        // If this hasn't been calculated yet, use the estimate
        if (maxOffset === undefined) {
          return estimatedRowHeight;
        }

        return Math.max(
          minRowHeight,
          rowVerticalPadding * 2 + maxOffset * itemHeight
        );
      },
    };

    return row;
  });

  return {
    ...state,
    allRows,
    hierarchy: buildVisibleHierarchy(
      originalHierarchy,
      hierarchyRecord,
      groupedItems,
      allRows
    ),
  };
}

export function newVisibleRows(state: TimelineState) {
  const { overscanRowStartIndex, overscanRowStopIndex } = state;

  const rows = state.allRows.slice(
    overscanRowStartIndex,
    // Need to include the +1 as slice does not include the end
    overscanRowStopIndex + 1
  );

  return {
    ...state,
    rows,
  };
}
