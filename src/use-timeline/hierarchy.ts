import {
  HierarchyNode,
  MappedDataNode,
  TimelineHierarchy,
  TimelineHierarchyLeaf,
  TimelineHierarchyNode,
} from "../interfaces";

import { TimelineState } from "./use-timeline-reducer";

export function newHierarchyRecord(state: TimelineState): TimelineState {
  const {
    originalHierarchy,
    expandedNodeIds = originalHierarchy.map(({ id }) => id),
  } = state;

  const hierarchyRecord: Record<
    HierarchyNode["id"],
    MappedDataNode
  > = Object.fromEntries([
    ...hierarchyEntries(originalHierarchy, expandedNodeIds),
  ]);

  return {
    ...state,
    hierarchyRecord,
  };
}

function* hierarchyEntries(
  dataNodes: HierarchyNode[] | undefined,
  expandedNodeIds: Array<HierarchyNode["id"]>,
  parentId?: HierarchyNode["id"],
  leafParentId?: HierarchyNode["id"],
  leafIndexRef = { current: -1 }
): Iterable<[HierarchyNode["id"], MappedDataNode]> {
  for (const dataNode of dataNodes || []) {
    const isNodeExpanded = expandedNodeIds.includes(dataNode.id);
    const isParentExpanded = Boolean(
      parentId && expandedNodeIds.includes(parentId)
    );

    const hasChildren = dataNode.children && dataNode.children.length > 0;

    const isLeaf = isParentExpanded && (!isNodeExpanded || !hasChildren);

    const newLeafParentId = leafParentId || (isLeaf ? dataNode.id : undefined);

    if (isLeaf) {
      leafIndexRef.current++;
    }

    yield [
      dataNode.id,
      {
        ...dataNode,
        parentId,
        isLeaf,
        isVisible: isParentExpanded || isNodeExpanded,
        leafParentId: newLeafParentId,
        leafIndex: leafIndexRef.current,
      },
    ];

    if (hasChildren) {
      yield* hierarchyEntries(
        dataNode.children,
        expandedNodeIds,
        dataNode.id,
        newLeafParentId,
        leafIndexRef
      );
    }
  }
}

export function buildVisibleHierarchy(
  hierarchy: HierarchyNode[],
  hierarchyRecord: Record<MappedDataNode["id"], MappedDataNode>,
  groupedItems: TimelineState["groupedItems"],
  allRows: TimelineState["allRows"]
): TimelineHierarchy[] {
  return hierarchy.flatMap(({ id }) => {
    const node = hierarchyRecord[id];

    if (!node?.isVisible) {
      return [];
    }

    if (node.isLeaf) {
      const items = groupedItems[node.leafIndex]?.flat() || [];
      const row = allRows[node.leafIndex];
      const timelineHierarchyLeaf: TimelineHierarchyLeaf = {
        key: node.id,
        node,
        items,
        get top() {
          return row.top;
        },
        get height() {
          return row.height;
        },
      };

      return timelineHierarchyLeaf;
    }

    const timelineHierarchyNode: TimelineHierarchyNode = {
      key: node.id,
      node,
      children: buildVisibleHierarchy(
        node.children || [],
        hierarchyRecord,
        groupedItems,
        allRows
      ),
      get top() {
        return this.children.length > 0 ? this.children[0].top : 0;
      },
      get height() {
        return this.children.reduce((a, b) => a + b.height, 0);
      },
    };

    return timelineHierarchyNode;
  });
}
