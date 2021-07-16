import { DataNode, MappedDataNode } from "../src/interfaces";

export function findLeaf(
  id: DataNode["id"],
  hierarchyRecord: Record<DataNode["id"], MappedDataNode>
): MappedDataNode | undefined {
  let dataNode = hierarchyRecord[id];

  if (!dataNode) {
    console.error(`Item has mismatching nodeId ${id}`);
    return;
  }

  if (dataNode.isLeaf) {
    return dataNode;
  }

  if (dataNode.isVisible) {
    console.error(`Item has mismatching non-leaf nodeId ${id}`);
    return;
  }

  // Not even the top level keys are expanded
  // This might be wrong
  if (!dataNode.parentId) {
    return;
  }

  return findLeaf(dataNode.parentId, hierarchyRecord);
}
