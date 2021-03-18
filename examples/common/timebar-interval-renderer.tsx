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
  isDay,
}: TimebarIntervalRendererProps): ReactElement {
  const { intervalDuration } = useContext(TimelineContext);
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

  if (isDay) {
    return (
      <div
        style={{
          ...style,
          justifyContent: 'center',
          alignItems: 'center',
          borderRight: '1px solid grey',
          borderBottom: '1px solid grey',
          backgroundColor: isActive ? 'red' : 'white',
        }}
      >
        {new Date(time).toLocaleString(getLocale(), {
          weekday: 'long',
          day: 'numeric',
        } as Intl.DateTimeFormatOptions)}
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        justifyContent: 'center',
        alignItems: 'center',
        borderRight: '1px solid grey',
        borderBottom: '1px solid grey',
        backgroundColor: isActive ? 'red' : 'white',
      }}
    >
      {new Date(time).toLocaleString(getLocale(), {
        timeStyle: 'short',
      } as Intl.DateTimeFormatOptions)}
    </div>
  );
}
