import React, { ReactElement, useMemo } from 'react';

import Timeline from '../../src';

import { randomGroups, randomItems } from '../generate-data';

export default function InteractiveExample(): ReactElement {
  const startTime = Date.now();
  const endTime = startTime + 1000 * 60 * 60 * 24; // 1 Day

  const groups = useMemo(() => randomGroups(100), []);

  const items = useMemo(() => randomItems(groups, 2, 2, startTime, endTime), [
    groups,
    startTime,
    endTime,
  ]);

  return (
    <Timeline
      startTime={startTime}
      endTime={endTime}
      width={1000}
      height={1000}
      intervalDuration={1000 * 60 * 60}
      intervalWidth={100}
      items={items}
      groups={groups}
      sidebarWidth={100}
      itemRenderer={({ style }) => (
        <div style={{ ...style, background: 'red' }} />
      )}
      columnRenderer={({ style, isOdd }) => (
        <div
          style={{
            ...style,
            background: isOdd ? 'rgba(0, 0, 0, 0.05)' : undefined,
          }}
        />
      )}
      groupRenderer={({ style, group }) => (
        <div style={{ ...style, background: 'white' }}>{group.name}</div>
      )}
      timebarIntervalRenderer={({ style, time }) => (
        <div style={{ ...style, background: 'white' }}>
          {new Date(time).toLocaleString('en', {
            timeStyle: 'short',
          })}
        </div>
      )}
    />
  );
}
