import React, { memo, ReactElement } from "react";
import { TimelineColumn } from "../interfaces";

export interface TimelineIntervalsProps {
  columns: TimelineColumn[];
  height?: number;
  top?: number;
}

export const TimelineIntervals = memo(function TimelineIntervals({
  columns,
  height,
  top,
}: TimelineIntervalsProps): ReactElement {
  return (
    <>
      {columns.map((column) => (
        <div
          key={column.key}
          style={{
            gridColumn: "1 / 3",
            gridRow: "2 / 3",
            position: "sticky",
            top,
            width: column.width,
            height,
            transform: `translateX(${column.left}px)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {new Date(column.start).toLocaleString(getLocale(), {
            timeStyle: "short",
          } as Intl.DateTimeFormatOptions)}
        </div>
      ))}
    </>
  );
});

function getLocale() {
  return navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
}
