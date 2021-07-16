import React, { ComponentPropsWithoutRef, ReactElement, useState } from "react";
import { Item, TimelineColumn as ITimelineColumn } from "../interfaces";
import { getIntersection, Intersection } from "../utils/interaction";

export interface TimelineColumnsProps extends ComponentPropsWithoutRef<"div"> {
  columns: ITimelineColumn[];
  paddingTop?: number;
  paddingBottom?: number;
  interactiveItem?: Item;
}

export interface TimelineColumnProps extends ComponentPropsWithoutRef<"div"> {
  column: ITimelineColumn;
  paddingTop?: number;
  paddingBottom?: number;
  isActive: boolean;
}

export function TimelineColumns({
  columns,
  interactiveItem,
  ...props
}: TimelineColumnsProps): ReactElement {
  return (
    <>
      {columns.map((column) => {
        const intersection = getIntersection(interactiveItem, column);

        const isActive =
          intersection === Intersection.CONTAINED ||
          intersection === Intersection.LEFT ||
          intersection === Intersection.RIGHT ||
          intersection === Intersection.INSIDE;

        return (
          <TimelineColumn
            key={column.key}
            column={column}
            isActive={isActive}
            {...props}
          />
        );
      })}
    </>
  );
}

export function TimelineColumn({
  column,
  paddingTop = 0,
  paddingBottom = 0,
  isActive,
  ...props
}: TimelineColumnProps): ReactElement {
  const [hovered, setHovered] = useState(false);

  const backgroundColor = isActive
    ? "rgba(0,0,0, 0.3)"
    : column.index % 2
    ? `rgba(0,0,0,${hovered ? 0.2 : 0})`
    : `rgba(0,0,0,${hovered ? 0.2 : 0.1})`;

  return (
    <div
      id={column.key}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
      style={{
        gridColumn: "1 / 3",
        gridRow: "3 / 4",
        position: "sticky",
        top: paddingTop,
        bottom: paddingBottom,
        width: column.width,
        transform: `translateX(${column.left}px)`,
        backgroundColor,
        ...props.style,
      }}
    />
  );
}
