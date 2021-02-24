import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import mergeRefs from 'react-merge-refs';
import {
  GridOnItemsRenderedProps,
  VariableSizeGrid,
  VariableSizeGridProps,
} from 'react-window';

import innerElementType from './inner-element';
import TimelineContext, {
  GroupRenderer,
  ItemRenderer,
  TimebarHeaderRenderer,
  TimelineContextValue,
  TimebarIntervalRenderer,
  UpdateItem,
  UpdateItemAction,
  RowRenderer,
  ColumnRenderer,
} from './context';

import { getTimelineData, Group, Item } from './timeline-data';
import { getIntervals, getTimeAtPosition, snapTime } from './utils/time';

type VariableSizeGridPropsOmitted =
  | 'children'
  | 'columnCount'
  | 'columnWidth'
  | 'innerElementType'
  | 'onItemsRendered'
  | 'outerElementType'
  | 'rowCount'
  | 'rowHeight';

export interface TimelineProps<I extends Item, G extends Group, D = any>
  extends Omit<VariableSizeGridProps, VariableSizeGridPropsOmitted> {
  columnRenderer?: ColumnRenderer;
  endDate: Date;
  groupRenderer: GroupRenderer<G>;
  groups: Group[];
  intervalDuration: number;
  intervalWidth: number;
  itemData?: D;
  itemHeight?: number;
  itemRenderer: ItemRenderer<I>;
  items: I[];
  minItemWidth?: number;
  rowRenderer?: RowRenderer<G>;
  sidebarWidth?: number;
  snapDuration?: number;
  startDate: Date;
  timebarHeaderHeight?: number;
  timebarHeaderRenderer?: TimebarHeaderRenderer;
  timebarIntervalHeight?: number;
  timebarIntervalRenderer: TimebarIntervalRenderer;
}

export default function Timeline<I extends Item, G extends Group, D = any>(
  props: TimelineProps<I, G, D>
): ReactElement {
  const {
    endDate,
    groups,
    height,
    intervalDuration,
    intervalWidth,
    itemData,
    itemHeight = 20,
    itemRenderer,
    groupRenderer,
    timebarIntervalRenderer,
    items,
    columnRenderer,
    rowRenderer,
    minItemWidth = 5,
    sidebarWidth = 0,
    snapDuration = 1000 * 60, // 1 minute
    startDate,
    timebarIntervalHeight = itemHeight,
    timebarHeaderHeight = 0,
    timebarHeaderRenderer = props => <div {...props} />,
    width,
    ...gridProps
  } = props;

  const gridRef = useRef<VariableSizeGrid>(null);
  const outerElementRef = useRef<HTMLDivElement>(null);
  const startTime = snapTime(startDate.getTime(), snapDuration);
  const endTime = snapTime(endDate.getTime(), snapDuration);
  const timebarHeight = timebarIntervalHeight + timebarHeaderHeight;

  const intervals = useMemo(() => {
    return getIntervals(
      new Date(startTime),
      new Date(endTime),
      intervalDuration
    );
  }, [startTime, endTime, intervalDuration]);

  const [itemMap, rowMap] = useMemo(() => {
    return getTimelineData({
      groups,
      items,
      intervals,
      itemHeight,
      timebarHeight,
      snapDuration,
    });
  }, [groups, items, intervals, itemHeight, timebarHeight, snapDuration]);

  const outerElementType = useMemo(
    () =>
      forwardRef(function TimelineOuter(props, ref) {
        return <div ref={mergeRefs([outerElementRef, ref])} {...props} />;
      }),
    []
  );

  const getValuesToUpdate: TimelineContextValue['getValuesToUpdate'] = useCallback(
    (event, action) => {
      if (!event.target) {
        return null;
      }

      const targetBox = event.target.getBoundingClientRect();
      const outerElement = outerElementRef.current?.getBoundingClientRect() || {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };

      const scrollLeft = outerElementRef.current?.scrollLeft || 0;
      const scrollTop = outerElementRef.current?.scrollTop || 0;

      const left = targetBox.left + scrollLeft - outerElement.left;
      const right = targetBox.right + scrollLeft - outerElement.left;

      const updatedValues: Partial<Item> = {
        start: Math.max(
          startTime,
          getTimeAtPosition(
            left,
            startTime,
            intervalDuration,
            intervalWidth,
            sidebarWidth,
            snapDuration
          )
        ),
        end: Math.min(
          endTime,
          getTimeAtPosition(
            right,
            startTime,
            intervalDuration,
            intervalWidth,
            sidebarWidth,
            snapDuration
          )
        ),
      };

      if (action !== UpdateItemAction.RESIZE) {
        const top = event.clientY + scrollTop - outerElement.left;

        const row = Array.from(rowMap.values()).find(row => {
          return row.top <= top && row.top + row.height >= top;
        });

        if (!row) {
          return null;
        }

        updatedValues.groupId = row.group.id;
      }

      return updatedValues as any;
    },
    [
      rowMap,
      startTime,
      endTime,
      intervalDuration,
      intervalWidth,
      sidebarWidth,
      snapDuration,
    ]
  );

  const updateItem = useCallback<UpdateItem<I>>(
    item => {
      const previous = itemMap.get(item.id);
      if (!previous) {
        throw new Error(
          'Tried to update item that was not previous in the timeline'
        );
      }
      const row = Array.from(rowMap.values()).find(
        ({ group }) => group.id === item.groupId
      );
      if (!row) {
        throw new Error(`Unable to find group with id ${item.groupId}`);
      }
      if (item.groupId !== previous.groupId) {
        previous.row.removeItem(item);
      }

      row.upsertItem(item);
      itemMap.set(item.id, { ...item, groupId: row.group.id, row });
      gridRef.current?.resetAfterRowIndex(
        Math.min(row.index, previous.row.index)
      );
    },
    [itemMap, rowMap]
  );

  const [visibleArea, setVisibleArea] = useState<GridOnItemsRenderedProps>({
    overscanColumnStartIndex: 0,
    overscanColumnStopIndex: 0,
    overscanRowStartIndex: 0,
    overscanRowStopIndex: 0,
    visibleColumnStartIndex: 0,
    visibleColumnStopIndex: 0,
    visibleRowStartIndex: 0,
    visibleRowStopIndex: 0,
  });

  const rowCount = groups.length;
  const columnCount = intervals.length;
  const columnWidth = useCallback(
    index => (index === 0 ? intervalWidth + sidebarWidth : intervalWidth),
    [intervalWidth, sidebarWidth]
  );
  const rowHeight = useCallback(
    (rowIndex: number) => rowMap.get(rowIndex)?.height || 0,
    [rowMap]
  );

  return (
    <TimelineContext.Provider
      value={{
        columnCount,
        columnRenderer,
        columnWidth,
        getValuesToUpdate,
        groupRenderer,
        groups,
        height,
        intervalDuration,
        intervalWidth,
        intervals,
        itemData,
        itemHeight,
        itemRenderer,
        minItemWidth,
        outerElementRef,
        rowCount,
        rowHeight,
        rowMap,
        rowRenderer,
        sidebarWidth,
        startDate,
        startTime,
        timebarHeaderHeight,
        timebarHeaderRenderer,
        timebarHeight,
        timebarIntervalHeight,
        timebarIntervalRenderer,
        visibleArea,
        width,
        updateItem: updateItem as TimelineContextValue['updateItem'],
      }}
    >
      <VariableSizeGrid
        {...gridProps}
        ref={gridRef}
        width={width}
        height={height}
        columnCount={columnCount}
        columnWidth={columnWidth}
        innerElementType={innerElementType}
        onItemsRendered={setVisibleArea}
        outerElementType={outerElementType}
        rowCount={rowCount}
        rowHeight={rowHeight}
      >
        {noopRenderer}
      </VariableSizeGrid>
    </TimelineContext.Provider>
  );
}

const noopRenderer = () => null;
