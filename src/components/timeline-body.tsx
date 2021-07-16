import React, { ComponentPropsWithRef, ReactElement } from "react";

export function TimelineBody(
  props: ComponentPropsWithRef<"div">
): ReactElement {
  return (
    <div
      style={{
        gridColumn: "1 / 3",
        gridRow: "3 / 4",
        position: "sticky",
        userSelect: "none",
        pointerEvents: "none",
      }}
      {...props}
    />
  );
}
