import React, { CSSProperties, ReactElement, useContext } from 'react';

import { Group, RowRendererProps } from '../../../src';
import InteractiveContext from '../interactive/interactive-context';

export default function RowRenderer({
  group,
  style,
}: RowRendererProps<
  Group & { color: CSSProperties['backgroundColor'] }
>): ReactElement {
  const { interaction } = useContext(InteractiveContext);

  const isActive = interaction && interaction.groupId === group.id;

  return (
    <div
      style={{
        ...style,
        backgroundColor: isActive ? 'red' : undefined,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    />
  );
}
