// import { useState } from "react";
// import { UseTimelineOptions } from ".";
// import { DataNode, Item, MappedDataNode, TimelineItem } from "../interfaces";
// import { Row } from "../row";
// import { TimelineHierarchy } from "../timeline-hierarchy";
// import { findLeaf } from "./find-leaf";

// export interface UseHierarchy {
//   rows: Row[];
//   items: TimelineItem[];
//   hierarchy: TimelineHierarchy;
// }

// export function useHierarchy({
//   hierarchy,
//   expandedKeys,
//   items,
//   ...options
// }: Required<UseTimelineOptions>): UseHierarchy {
//   const [state, setRows] = useState<UseHierarchy>(() =>
//     calculateHierarchy({ hierarchy, expandedKeys, items, ...options })
//   );

//   const [[prevHierarchy, prevExpandedKeys, prevItems], setPrev] = useState([
//     hierarchy,
//     expandedKeys,
//     items,
//   ]);

//   if (
//     hierarchy !== prevHierarchy ||
//     expandedKeys !== prevExpandedKeys ||
//     items !== prevItems
//   ) {
//     setPrev([hierarchy, expandedKeys, items]);
//     setRows(calculateHierarchy({ hierarchy, expandedKeys, items, ...options }));
//   }

//   return state;
// }

// function calculateHierarchy({
//   hierarchy,
//   expandedKeys,
//   items,
//   itemHeight,
//   minGroupHeight,
//   groupTopPadding,
//   groupBottomPadding,
//   paddingTop,
// }: Required<UseTimelineOptions>): UseHierarchy {
//   const indexedItems = new Map<DataNode["id"], Set<Item>>();
//   const nodeCache: Record<DataNode["id"], DataNode["id"]> = {};

//   const hierarchyRecord: Record<
//     DataNode["id"],
//     MappedDataNode
//   > = Object.fromEntries([...hierarchyEntries(hierarchy, expandedKeys)]);

//   const leafs = Object.values(hierarchyRecord).filter((node) => node.isLeaf);

//   for (const item of items) {
//     const key =
//       nodeCache[item.nodeId] || findLeaf(item.nodeId, hierarchyRecord)?.id;

//     if (!key) {
//       console.warn(`Found item(s) with invalid nodeId: ${key}`);
//       continue;
//     }

//     nodeCache[item.nodeId] = key;

//     const collection = indexedItems.get(key);
//     if (!collection) {
//       indexedItems.set(key, new Set([item]));
//     } else {
//       collection.add(item);
//     }
//   }

//   let previousRow: Row | undefined = undefined;

//   const rowRecord: Map<DataNode["id"], Row> = new Map();

//   for (const [index, leafNode] of leafs.entries()) {
//     const leafNodeId = leafNode.id;

//     const row: Row = new Row({
//       items: indexedItems.get(leafNode.id) || new Set(),
//       previousRow,
//       leafNodeId,
//       index,

//       itemHeight,
//       minGroupHeight,
//       groupTopPadding,
//       groupBottomPadding,

//       timelinePaddingTop: paddingTop,
//     });

//     rowRecord.set(leafNodeId, row);
//     previousRow = row;
//   }

//   return {
//     rows: Array.from(rowRecord.values()),
//     hierarchy: new TimelineHierarchy(hierarchy, hierarchyRecord, rowRecord),
//   };
// }

// function* hierarchyEntries(
//   dataNodes: DataNode[],
//   expandedKeys: Array<DataNode["id"]>,
//   parentId?: DataNode["id"],
//   isHidden?: DataNode["id"]
// ): Iterable<[DataNode["id"], MappedDataNode]> {
//   for (const dataNode of dataNodes) {
//     const isNodeExpanded = expandedKeys.includes(dataNode.id);
//     const isParentExpanded = Boolean(
//       parentId && expandedKeys.includes(parentId)
//     );

//     yield [
//       dataNode.id,
//       {
//         ...dataNode,
//         parentId,
//         isVisible: isParentExpanded || isNodeExpanded,
//         isLeaf: isParentExpanded && !isNodeExpanded,
//       },
//     ];

//     if (dataNode.children) {
//       yield* hierarchyEntries(
//         dataNode.children,
//         expandedKeys,
//         dataNode.id,
//         isHidden
//       );
//     }
//   }
// }
