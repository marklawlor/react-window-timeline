import React, { ReactElement, useState } from 'react';
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

  const [childGroups] = useState(() => randomGroups(6));
  const [items] = useState(() =>
    randomItems(childGroups, 1, 5, startTime, endTime)
  );

  const [groups] = useState(() => [
    {
      name: 'my-collection',
      groups: childGroups.slice(0, childGroups.length / 2),
    },
    {
      name: 'my-collection2',
      groups: childGroups.slice(childGroups.length / 2),
    },
  ]);

  return (
    <div
      style={{ height: '100vh', boxSizing: 'border-box', overflow: 'hidden' }}
    >
      <AutoSizer>
        {({ width, height }) => {
          // Fit 12 intervals, floor to remove rounding errors
          const intervalWidth = 75;

          return (
            <InteractionContextProvider>
              <Timeline
                /* Data */
                startTime={startTime}
                endTime={endTime}
                width={width}
                height={height}
                items={items}
                groups={groups}
                itemData={{ groups: childGroups }}
                /* Options */
                intervalDuration={intervalDuration}
                estimatedRowHeight={500}
                initialScrollTime={addMinutes(startTime, 3 * 60).getTime()}
                intervalWidth={intervalWidth}
                itemHeight={20}
                collectionSidebarWidth={150}
                groupSidebarWidth={150}
                timebarHeaderHeight={150}
                timebarIntervalHeight={50}
                overscanColumnCount={5}
                overscanRowCount={5}
                /* Renderers */
                bodyRenderer={BodyRenderer}
                columnRenderer={ColumnRenderer}
                groupRenderer={GroupRenderer as any}
                itemRenderer={InteractiveItemRenderer}
                rowRenderer={RowRenderer as any}
                sidebarHeaderRenderer={SidebarHeaderRenderer}
                sidebarRenderer={SidebarRenderer}
                timebarHeaderRenderer={TimebarHeaderRenderer}
                timebarIntervalRenderer={TimebarIntervalRenderer as any}
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
