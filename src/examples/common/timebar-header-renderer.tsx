import React, { ReactElement, useContext } from 'react';

import { TimebarHeaderProps, TimelineContext } from '../../../src';

export default function TimebarHeaderRenderer({
  style,
}: TimebarHeaderProps): ReactElement {
  const { width } = useContext(TimelineContext);

  return (
    <div
      style={{
        ...style,
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          width,
          position: 'sticky',
          left: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Example timeline
      </div>
    </div>
  );
}
