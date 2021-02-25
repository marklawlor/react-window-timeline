import React, { ReactElement, useContext } from 'react';

import { TimebarIntervalRendererProps, TimelineContext } from '../../src';
import InteractionContext from '../interactive/interaction-context';

function getLocale() {
  return navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
}

export default function TimebarIntervalRenderer({
  time,
  style,
}: TimebarIntervalRendererProps): ReactElement {
  const { sidebarWidth, intervalDuration } = useContext(TimelineContext);
  const { interaction } = useContext(InteractionContext);

  let isActive = false;

  if (interaction) {
    if (
      time <= interaction.start &&
      time + intervalDuration >= interaction.start
    ) {
      isActive = true;
    } else if (
      time >= interaction.start &&
      time + intervalDuration <= interaction.end
    ) {
      isActive = true;
    } else if (
      time <= interaction.end &&
      time + intervalDuration >= interaction.end
    ) {
      isActive = true;
    }
  }

  return (
    <>
      <div
        style={{
          ...style,
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRight: '1px solid grey',
          borderBottom: '1px solid grey',
          backgroundColor: isActive ? 'red' : 'white',
        }}
      >
        <span
          style={{
            position: 'sticky',
            left: sidebarWidth,
          }}
        >
          {new Date(time).toLocaleString(getLocale(), {
            timeStyle: 'short',
          } as Intl.DateTimeFormatOptions)}
        </span>
      </div>
    </>
  );
}
