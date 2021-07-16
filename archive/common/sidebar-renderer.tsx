import React, { ReactElement } from "react";

import { SidebarRendererProps } from "../../src";

export default function SidebarRenderer({
  style,
  ...props
}: SidebarRendererProps): ReactElement {
  return (
    <div
      {...props}
      style={{
        ...style,
        backgroundColor: "white",
        borderRight: "1px solid grey",
      }}
    ></div>
  );
}
