import React, { CSSProperties, ReactElement } from "react";
import {
  HierarchyNode,
  TimelineHierarchy,
  TimelineHierarchyLeaf,
  TimelineHierarchyNode,
} from "../interfaces";

export interface TimelineSidebarProps {
  hierarchy: TimelineHierarchy[];
  paddingTop?: number;
  style?: CSSProperties;
  toggleVisibility: (key: HierarchyNode["id"]) => void;
}

export function TimelineSidebar({
  hierarchy,
  paddingTop,
  toggleVisibility,
}: TimelineSidebarProps): ReactElement {
  console.log("hierarchy", hierarchy);
  return (
    <>
      <div
        id="sidebar"
        style={{
          gridColumn: 1,
          gridRow: "3 / 4",
          background: "grey",
          zIndex: 2,
        }}
      />
      {hierarchy.map((node) => (
        <FractalSidebar
          key={node.key}
          node={node}
          paddingTop={paddingTop}
          toggleVisibility={toggleVisibility}
          root
        />
      ))}
    </>
  );
}

function FractalSidebar({
  node,
  root,
  toggleVisibility,
  paddingTop = 0,
}: {
  node: TimelineHierarchy;
  toggleVisibility: (key: HierarchyNode["id"]) => void;
  paddingTop?: number;
  root?: boolean;
}): ReactElement {
  return isNode(node) ? (
    <div
      style={{
        display: "flex",
        flexGrow: 1,
        flexShrink: 0,
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        height: node.height,
        zIndex: 3,

        ...(root
          ? {
              gridRow: 1,
              gridColumn: 1,
              transform: `translateY(${node.top + paddingTop}px)`,
            }
          : {}),
      }}
    >
      <div
        onClick={() => toggleVisibility(node.node.id)}
        style={{
          display: "flex",
          flexGrow: 1,
        }}
      >
        {node.node.id}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {node.children.map((child) => (
          <FractalSidebar
            key={child.key}
            node={child}
            toggleVisibility={toggleVisibility}
          />
        ))}
      </div>
    </div>
  ) : (
    <Row key={node.key} node={node} toggleVisibility={toggleVisibility} />
  );
}

function isNode(n: TimelineHierarchy): n is TimelineHierarchyNode {
  return "children" in n;
}

function Row({
  node,
  toggleVisibility,
}: {
  node: TimelineHierarchyLeaf;
  toggleVisibility: (key: HierarchyNode["id"]) => void;
}): ReactElement {
  return (
    <div
      style={{
        height: node.height,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={() => toggleVisibility(node.node.id)}
    >
      {node.node.id}
    </div>
  );
}
