import React, {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useContext,
} from 'react';

import { BodyRendererProps, TimelineContext } from '../../src';

export default function BodyRenderer(props: BodyRendererProps): ReactElement {
  const { createItemAtCursor, intervalDuration } = useContext(TimelineContext);

  const handleDoubleClick = useCallback<MouseEventHandler<HTMLElement>>(
    event => {
      createItemAtCursor(event, {
        id: `new_${Date.now()}`,
        defaultGroupId: 'UNASSIGNED_PROJECT',
        duration: intervalDuration,
      });
    },
    [createItemAtCursor, intervalDuration]
  );
  return <div {...props} onDoubleClick={handleDoubleClick} />;
}
