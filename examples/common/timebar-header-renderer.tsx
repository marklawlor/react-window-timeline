import React, { ReactElement } from 'react';

import { TimebarHeaderProps } from '../../src';

export default function TimebarHeaderRenderer({
  style,
}: TimebarHeaderProps): ReactElement {
  return (
    <div
      style={{
        ...style,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid grey',
      }}
    >
      Example timeline
    </div>
  );
}
