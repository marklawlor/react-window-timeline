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
import SidebarHeaderRenderer from '../common/sidebar-header-renderer';

export default function InteractiveExample(): ReactElement {
  const startTime = startOfDay(new Date()).getTime();
  const endTime = addDays(startOfDay(new Date()), 1).getTime();
  const intervalDuration = 1000 * 60 * 60; // 1 hour

  const groups = useMemo(() => randomGroups(100), []);

  const items = useMemo(() => randomItems(groups, 1, 50, startTime, endTime), [
    groups,
    startTime,
    endTime,
  ]);

  const groupMap = Object.fromEntries(groups.map(group => [group.id, group]));

  return (
    <div style={{ height: '100vh', boxSizing: 'border-box' }}>
      <AutoSizer>
        {({ width, height }) => {
          const sidebarWidth = 150;

          // Fit 12 intervals, floor to remove rounding errors
          const intervalWidth = Math.floor((width - sidebarWidth) / 12);

          return (
            <InteractionContextProvider>
              <Timeline
                startTime={startTime}
                endTime={endTime}
                width={width}
                height={height}
                items={items}
                groups={groups}
                intervalDuration={intervalDuration}
                sidebarWidth={sidebarWidth}
                intervalWidth={intervalWidth}
                timebarIntervalHeight={50}
                timebarHeaderHeight={250}
                itemHeight={20}
                initialScrollTime={addMinutes(startTime, 3 * 60).getTime()}
                itemData={{ groups: groupMap }}
                itemRenderer={InteractiveItemRenderer}
                columnRenderer={ColumnRenderer}
                groupRenderer={GroupRenderer}
                rowRenderer={RowRenderer}
                timebarHeaderRenderer={TimebarHeaderRenderer}
                timebarIntervalRenderer={TimebarIntervalRenderer}
                sidebarHeaderRenderer={SidebarHeaderRenderer}
              >
                <div id="test" />
              </Timeline>
            </InteractionContextProvider>
          );
        }}
      </AutoSizer>
    </div>
  );
}
