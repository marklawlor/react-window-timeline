import React, {
  ComponentPropsWithoutRef,
  memo,
  ReactElement,
  useState,
} from "react";
import { Item, TimelineRow as ITimelineRow } from "../interfaces";

export interface TimelineRowsProps extends ComponentPropsWithoutRef<"div"> {
  rows: ITimelineRow[];
  paddingTop?: number;
  interactiveItem?: Item;
}

export interface TimelineRowProps extends ComponentPropsWithoutRef<"div"> {
  row: ITimelineRow;
  paddingTop?: number;
  interactiveItem?: Item;
}

export function TimelineRows({
  rows,
  ...props
}: TimelineRowsProps): ReactElement {
  return (
    <>
      {rows.map((row) => (
        <TimelineRow key={row.key} row={row} {...props} />
      ))}
    </>
  );
}

const TimelineRow = memo(function TimelineRow({
  row,
  paddingTop = 0,
  interactiveItem,
  ...props
}: TimelineRowProps): ReactElement {
  const [hovered, setHovered] = useState(false);

  let backgroundColor: string | undefined;
  if (interactiveItem) {
    backgroundColor =
      interactiveItem?.nodeId === row.id
        ? `rgba(0,0,0, 0.3)`
        : row.index % 2
        ? `rgba(0,0,0,0)`
        : `rgba(0,0,0,0.1)`;
  } else {
    backgroundColor =
      row.index % 2
        ? `rgba(0,0,0,${hovered ? 0.2 : 0})`
        : `rgba(0,0,0,${hovered ? 0.2 : 0.1})`;
  }

  return (
    <div
      id={row.key}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
      style={{
        gridColumn: "1 / 3",
        gridRow: 1,
        position: "sticky",
        left: 0,
        height: row.height,
        transform: `translateY(${row.top + paddingTop}px)`,
        backgroundColor,
        ...props.style,
      }}
    />
  );
});
