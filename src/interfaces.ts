import { RefObject, MouseEvent } from "react";

import { VariableSizeGrid, VariableSizeGridProps } from "react-window";

export interface HierarchyNode {
  id: string | number;
  children?: HierarchyNode[];
}

export interface MappedDataNode extends HierarchyNode {
  isVisible: boolean;
  isLeaf: boolean;
  leafParentId?: HierarchyNode["id"];
  leafIndex: number;
  parentId?: HierarchyNode["id"];
}

export interface Item {
  id: string | number;
  nodeId: HierarchyNode["id"];
  start: number;
  end: number;
}

export interface TimelineItem {
  id: Item["id"];
  item: Item;
  key: string;
  top: number;
  left: number;
  width: number;
  height: number;
  offset: number;
  rowIndex: number;
}

export interface TimelineSticky {
  itemId: TimelineItem["id"];
}

export interface TimelineColumn {
  key: string;
  index: number;
  left: number;
  width: number;
  start: number;
  end: number;
}

export interface TimelineRow {
  id: HierarchyNode["id"];
  key: string;
  index: number;
  top: number;
  height: number;
}

export type TimelineHierarchy = TimelineHierarchyLeaf | TimelineHierarchyNode;

export interface TimelineHierarchyLeaf {
  key: HierarchyNode["id"];
  node: HierarchyNode;
  top: number;
  height: number;
  items: Item[];
}

export interface TimelineHierarchyNode {
  key: HierarchyNode["id"];
  node: HierarchyNode;
  children: Array<TimelineHierarchy>;
  top: number;
  height: number;
}

export type DataAtPosition = (
  event: { x: number; y: number },
  options?: {
    duration?: number;
    width?: number;
    scrollLeft?: number;
  }
) => {
  time: number;
  row?: TimelineRow;
  suggestedRow?: TimelineRow;
  suggestedItem?: Pick<Item, "nodeId" | "start" | "end">;
};

export type OnItemsRenderedFn = NonNullable<
  VariableSizeGridProps["onItemsRendered"]
>;

export type TimelineControl = Required<
  Pick<
    VariableSizeGridProps,
    | "outerRef"
    | "height"
    | "width"
    | "rowCount"
    | "rowHeight"
    | "columnCount"
    | "columnWidth"
    | "estimatedColumnWidth"
    | "onItemsRendered"
  >
> & {
  ref: RefObject<VariableSizeGrid<any>>;
  outerRef: RefObject<any>;
};

export type GetUpdatedItem = (
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  item: Item,
  options: {
    action?: UpdateItemAction;
    snapToRow?: boolean;
  }
) => null | Item;

export enum UpdateItemAction {
  MOVE,
  RESIZE,
}
