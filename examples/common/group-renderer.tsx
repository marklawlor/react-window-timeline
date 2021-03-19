import React, { CSSProperties, ReactElement, useContext } from 'react';

import { Group, TimelineContext, GroupRendererProps } from '../../src';

export default function GroupRenderer({
  group,
  style,
}: GroupRendererProps<
  Group & { color: CSSProperties['backgroundColor'] }
>): ReactElement {
  const { timebarHeaderHeight, timebarIntervalHeight } = useContext(
    TimelineContext
  );

  const timebarHeight = timebarHeaderHeight + timebarIntervalHeight;

  return (
    <div style={{ ...style, backgroundColor: 'white' }}>
      <div
        style={{
          backgroundColor: group.color,
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
