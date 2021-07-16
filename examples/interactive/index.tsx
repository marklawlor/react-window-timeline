import React, {
  CSSProperties,
  MouseEventHandler,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { addDays, set, startOfDay } from "date-fns";

import { HierarchyNode, Item, Timeline, useTimeline } from "../../src";
import {
  TimelineColumns,
  TimelineItems,
  TimelineRows,
} from "../../src/components";

import { TimelineSidebar } from "../../src/components/timeline-sidebar";
import { TimelineIntervals } from "../../src/components/timeline-intervals";

const startTime = startOfDay(new Date()).getTime();
const endTime = addDays(startOfDay(new Date()), 1).getTime();

const hour = 1000 * 60 * 60;
const day = hour * 24;

const intervalDuration = day;
const visualIntervalDuration = hour;

const hierarchy: HierarchyNode[] = [
  {
    id: "1",
    children: [
      {
        id: "1-1",
        children: [
          {
            id: "1-1-1",
          },
          {
            id: "1-1-2",
          },
        ],
      },
      {
        id: "1-2",
      },
    ],
  },
  {
    id: "2",
    children: [
      {
        id: "2-1",
      },
    ],
  },
];

export default function InteractiveExample(): ReactElement {
  return (
    <div
      style={{
        height: "100vh",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <AutoSizer>
        {({ width, height }) => (
          <AutoSizedTimeline width={width} height={height} />
        )}
      </AutoSizer>
    </div>
  );
}

function AutoSizedTimeline({ width, height }: Size) {
  const [expandedNodeIds, setExpandedNodeIds] = useState<
    Array<HierarchyNode["id"]>
  >(["1", "2"]);

  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      nodeId: "1-1-2",
      start: set(startTime, {
        hours: 10,
        minutes: 30,
      }).getTime(),
      end: set(startTime, {
        hours: 11,
        minutes: 30,
      }).getTime(),
    },
  ]);

  const [interactiveItem, setInteractiveItem] = useState<Item>();

  const snapDuration = 5;

  const intervalHeight = 50;
  const headerHeight = 50;

  const paddingTop = intervalHeight + headerHeight;
  const paddingLeft = 150;

  const intervalWidth = Math.floor((width - paddingLeft) / 12);

  const timeline = useTimeline({
    items,
    hierarchy,
    expandedNodeIds,

    height,
    width,

    itemHeight: 20,
    minRowHeight: 10,

    startTime,
    endTime,

    intervalWidth,
    intervalDuration,
    visualIntervalDuration,

    snapDuration,
    paddingTop,
    paddingLeft,
  });

  const headerStyles: CSSProperties = {
    gridColumn: "1 / 3",
    gridRow: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    left: 0,
    top: 0,
    position: "sticky",
    zIndex: 2,
  };

  const { snapTime, dataAtPosition } = timeline;

  const handleDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const { suggestedItem } = dataAtPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (!suggestedItem) {
        return;
      }

      setItems([
        ...items,
        {
          id: `new_${Date.now()}`,
          ...suggestedItem,
        },
      ]);
    },
    [items, snapTime, dataAtPosition, visualIntervalDuration]
  );

  const updateItem = useCallback(
    (item: Item) => {
      const newItems = [...items];
      const itemIndex = newItems.findIndex(({ id }) => id === item.id);

      if (itemIndex < 0) {
        return;
      }

      newItems[itemIndex] = item;
      setItems(newItems);
    },
    [items, setItems]
  );

  const timelineStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: `${paddingLeft}px ${width}px`,
      gridTemplateRows: `${headerHeight}px ${intervalHeight}px 1fr`,
    }),
    [paddingLeft, headerHeight, intervalHeight, width]
  );

  const toggleVisibility = useCallback(
    (key: HierarchyNode["id"]) => {
      if (expandedNodeIds.includes(key)) {
        const newExpandedNodeIds = expandedNodeIds.filter(
          (expandedKey) => expandedKey !== key
        );
        setExpandedNodeIds(newExpandedNodeIds);
      } else {
        setExpandedNodeIds([...expandedNodeIds, key]);
      }

      timeline.resetAfterRowIndex(0);
    },
    [timeline.resetAfterRowIndex, expandedNodeIds, setExpandedNodeIds]
  );

  return (
    <Timeline control={timeline.control} style={timelineStyle}>
      <TimelineIntervals
        columns={timeline.columns}
        top={headerHeight}
        height={intervalHeight}
      />

      <TimelineColumns
        columns={timeline.columns}
        paddingTop={paddingTop}
        onDoubleClick={handleDoubleClick}
        interactiveItem={interactiveItem}
      />

      <TimelineRows
        rows={timeline.rows}
        paddingTop={paddingTop}
        onDoubleClick={handleDoubleClick}
        interactiveItem={interactiveItem}
      />

      <TimelineItems
        items={timeline.items}
        control={timeline.control}
        updateItem={updateItem}
        dataAtPosition={dataAtPosition}
        setInteractiveItem={setInteractiveItem}
      />

      <div style={headerStyles}>Header</div>
      <TimelineSidebar
        hierarchy={timeline.hierarchy}
        paddingTop={paddingTop}
        toggleVisibility={toggleVisibility}
      />
    </Timeline>
  );
}
