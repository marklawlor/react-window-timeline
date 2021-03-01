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
import SidebarRenderer from '../common/sidebar-renderer';
import BodyRenderer from '../common/body-renderer';

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
    <div
      style={{ height: '100vh', boxSizing: 'border-box', overflow: 'hidden' }}
    >
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
                bodyRenderer={BodyRenderer}
                columnRenderer={ColumnRenderer}
                estimatedRowHeight={500}
                groupRenderer={GroupRenderer}
                initialScrollTime={addMinutes(startTime, 3 * 60).getTime()}
                intervalWidth={intervalWidth}
                itemData={{ groups: groupMap }}
                itemHeight={20}
                itemRenderer={InteractiveItemRenderer}
                rowRenderer={RowRenderer}
                sidebarHeaderRenderer={SidebarHeaderRenderer}
                sidebarRenderer={SidebarRenderer}
                sidebarWidth={sidebarWidth}
                timebarHeaderHeight={250}
                timebarHeaderRenderer={TimebarHeaderRenderer}
                timebarIntervalHeight={50}
                timebarIntervalRenderer={TimebarIntervalRenderer}
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
