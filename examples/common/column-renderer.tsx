import React, { ReactElement } from 'react';

import { ColumnRendererProps } from '../../src';

export default function ColumnRenderer({
  style,
  isOdd,
}: ColumnRendererProps): ReactElement {
  return (
    <div
      style={{
        ...style,
        backgroundColor: isOdd ? 'rgba(0,0,0,0.05)' : undefined,
      }}
    ></div>
  );
}
