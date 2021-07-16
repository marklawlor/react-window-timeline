import React, { ReactElement } from "react";

import { SidebarHeaderRendererProps } from "../../src";

export default function SidebarHeaderRenderer({
  style,
}: SidebarHeaderRendererProps): ReactElement {
  return (
    <div
      style={{
        ...style,
        borderBottom: "1px solid gray",
        borderRight: "1px solid gray",
        backgroundColor: "white",
      }}
    />
  );
}
