import React, { CSSProperties, ReactElement, useContext } from 'react';

import { Group, TimelineContext, GroupRendererProps } from '../../src';
import InteractionContext from '../interactive/interaction-context';

export default function GroupRenderer({
  group,
  style,
}: GroupRendererProps<
  Group & { color: CSSProperties['backgroundColor'] }
>): ReactElement {
  const { timebarHeight } = useContext(TimelineContext);
  const { interaction } = useContext(InteractionContext);

  const isActive = interaction && interaction.groupId === group.id;

  return (
    <div style={{ ...style, backgroundColor: 'white' }}>
      <div
        style={{
          backgroundColor: isActive ? 'red' : group.color,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRight: '1px solid grey',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <span
          style={{
            position: 'sticky',
            top: timebarHeight,
          }}
        >
          {group.name}
        </span>
      </div>
    </div>
  );
}
