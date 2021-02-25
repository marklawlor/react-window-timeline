import React, { ReactElement, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { addDays, addMinutes, startOfDay } from 'date-fns';

import Timeline from '../../src';
import InteractiveItemRenderer from './interactive-item';
import GroupRenderer from '../common/group-renderer';
import TimebarIntervalRenderer from '../common/timebar-interval-renderer';
import TimebarHeaderRenderer from '../common/timebar-header-renderer';
import RowRenderer from '../common/row-renderer';
import ColumnRenderer from '../common/column-renderer';

import { randomGroups, randomItems } from '../generate-data';
import { InteractionContextProvider } from './interaction-context';

export default function InteractiveExample(): ReactElement {
  const startTime = startOfDay(new Date()).getTime();
  const endTime = addDays(startOfDay(new Date()), 1).getTime();
  const intervalDuration = 1000 * 60 * 60; // 1 hour

  const groups = useMemo(() => randomGroups(100), []);

  const items = useMemo(() => randomItems(groups, 0, 50, startTime, endTime), [
    groups,
    startTime,
    endTime,
  ]);

  const groupMap = Object.fromEntries(groups.map(group => [group.id, group]));

  return (
    <div style={{ height: '100vh' }}>
      <AutoSizer>
        {({ width, height }) => {
          const sidebarWidth = 150;
          const intervalWidth = (width - sidebarWidth) / 12;
          return (
            <InteractionContextProvider>
              <Timeline
                startTime={startTime}
                endTime={endTime}
                width={width}
                height={height}
                groups={groups}
                intervalDuration={intervalDuration}
                sidebarWidth={sidebarWidth}
                intervalWidth={intervalWidth}
                itemHeight={20}
                itemData={{ groups: groupMap }}
                itemRenderer={InteractiveItemRenderer}
                items={items}
                initialScrollTime={addMinutes(startTime, 3 * 60).getTime()}
                columnRenderer={ColumnRenderer}
                groupRenderer={GroupRenderer}
                rowRenderer={RowRenderer}
                timebarHeaderHeight={50}
                timebarHeaderRenderer={TimebarHeaderRenderer}
                timebarIntervalHeight={50}
                timebarIntervalRenderer={TimebarIntervalRenderer}
              />
            </InteractionContextProvider>
          );
        }}
      </AutoSizer>
    </div>
  );
}
