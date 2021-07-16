import React, { ReactElement, useContext } from "react";

import { RowRendererProps } from "../../src";
import InteractionContext from "../interaction-context";

export default function RowRenderer({
  group,
  style,
}: RowRendererProps): ReactElement {
  const { interaction } = useContext(InteractionContext);

  const isActive = interaction && interaction.groupId === group.id;

  return (
    <div
      style={{
        ...style,
        backgroundColor: isActive ? "red" : undefined,
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      }}
    />
  );
}
