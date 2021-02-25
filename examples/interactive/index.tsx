import React, { ReactElement, useMemo } from 'react';
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

  const items = useMemo(() => randomItems(groups, 2, 2, startTime, endTime), [
    groups,
    startTime,
    endTime,
  ]);

  const groupMap = Object.fromEntries(groups.map(group => [group.id, group]));

  return (
    <InteractionContextProvider>
      <Timeline
        columnRenderer={ColumnRenderer}
        endTime={endTime}
        groupRenderer={GroupRenderer}
        groups={groups}
        height={1000}
        intervalDuration={intervalDuration}
        intervalWidth={100}
        itemHeight={100}
        itemData={{ groups: groupMap }}
        itemRenderer={InteractiveItemRenderer}
        items={items}
        rowRenderer={RowRenderer}
        sidebarWidth={100}
        startTime={startTime}
        initialScrollTime={addMinutes(startTime, 3 * 60).getTime()}
        timebarHeaderHeight={50}
        timebarHeaderRenderer={TimebarHeaderRenderer}
        timebarIntervalHeight={50}
        timebarIntervalRenderer={TimebarIntervalRenderer}
        width={750}
      />
    </InteractionContextProvider>
  );
}
