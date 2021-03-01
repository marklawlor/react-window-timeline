import React, {
  CSSProperties,
  forwardRef,
  memo,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  areEqual,
  GridOnItemsRenderedProps,
  VariableSizeGrid,
  VariableSizeGridProps,
} from 'react-window';

import TimelineContext, {
  GroupRenderer,
  ItemRenderer,
  TimebarHeaderRenderer,
  TimelineContextValue,
  TimebarIntervalRenderer,
  UpsertItem,
  UpdateItemAction,
  RowRenderer,
  ColumnRenderer,
  SidebarHeaderRenderer,
  SidebarRenderer,
} from './context';

import innerElementType from './inner-element';
import { getTimelineData, Group, Item } from './timeline-data';
import {
  getIntervals,
  getPositionAtTime,
  getTimeAtPosition,
  snapTime,
} from './utils/time';

type VariableSizeGridPropsOmitted =
  | 'children'
  | 'columnCount'
  | 'columnWidth'
  | 'innerElementType'
  | 'onItemsRendered'
  | 'outerElementType'
  | 'rowCount'
  | 'rowHeight';

export interface TimelineProps<
  I extends Item = Item,
  G extends Group = Group,
  D = any
> extends Omit<VariableSizeGridProps, VariableSizeGridPropsOmitted> {
  // Required
  endTime: number;
  groups: Group[];
  height: number;
  intervalDuration: number;
  intervalWidth: number;
  itemRenderer: ItemRenderer<I>;
  items: I[];
  startTime: number;
  width: number;

  // Optional
  children?: ReactElement | null;
  columnRenderer?: ColumnRenderer;
  groupRenderer?: GroupRenderer<G>;
  groupTopPadding?: number;
  groupBottomPadding?: number;
  initialScrollTime?: number;
  itemData?: D;
  itemHeight?: number;
  minItemWidth?: number;
  minGroupHeight?: number;
  rowRenderer?: RowRenderer<G>;
  sidebarHeaderRenderer?: SidebarHeaderRenderer;
  sidebarRenderer?: SidebarRenderer;
  sidebarWidth?: number;
  snapDuration?: number;
  timebarHeaderHeight?: number;
  timebarHeaderRenderer?: TimebarHeaderRenderer;
  timebarIntervalHeight?: number;
  timebarIntervalRenderer?: TimebarIntervalRenderer;
}

export default function Timeline<I extends Item, G extends Group, D = any>(
  props: TimelineProps<I, G, D>
): ReactElement {
  const {
    // Required
    endTime: initialEndTime,
    groups,
    height,
    intervalDuration,
    intervalWidth,
    itemRenderer,
    items,
    startTime: initialStartTime,
    width,
    // Optional
    children,
    itemData,
    itemHeight = 20,
    groupBottomPadding = 0,
    groupRenderer,
    groupTopPadding = 0,
    timebarIntervalRenderer,
    columnRenderer,
    rowRenderer,
    minItemWidth = 5,
    minGroupHeight = 0,
    sidebarWidth = 0,
    snapDuration = 1000 * 60, // 1 minute
    timebarIntervalHeight = itemHeight,
    timebarHeaderHeight = 0,
    timebarHeaderRenderer,
    sidebarHeaderRenderer = props => <div {...props} />,
    sidebarRenderer = props => <div {...props} />,
    initialScrollLeft = 0,
    initialScrollTime,
    ...gridProps
  } = props;

  const gridRef = useRef<VariableSizeGrid>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  const startTime = snapTime(initialStartTime, snapDuration);
  const endTime = snapTime(initialEndTime, snapDuration);
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
      minGroupHeight,
      groupTopPadding,
      groupBottomPadding,
    });
  }, [
    groups,
    items,
    intervals,
    itemHeight,
    timebarHeight,
    snapDuration,
    minGroupHeight,
    groupTopPadding,
    groupBottomPadding,
  ]);

  const [stickyItemIds, setStickyItemIds] = useState<Array<Item['id']>>([]);
  const handleSetStickyItemIds = useCallback(
    (ids: Array<Item['id']>) => {
      setStickyItemIds(
        ids.map(id => {
          const item = itemMap.get(id);

          if (!item) {
            throw new Error('Item is not mapped');
          }

          return id;
        })
      );
    },
    [setStickyItemIds, itemMap]
  );

  const [
    {
      overscanColumnStartIndex,
      overscanColumnStopIndex,
      overscanRowStartIndex,
      overscanRowStopIndex,
      visibleColumnStartIndex,
      visibleColumnStopIndex,
      visibleRowStartIndex,
      visibleRowStopIndex,
    },
    setVisibleArea,
  ] = useState<GridOnItemsRenderedProps>({
    overscanColumnStartIndex: 0,
    overscanColumnStopIndex: 0,
    overscanRowStartIndex: 0,
    overscanRowStopIndex: 0,
    visibleColumnStartIndex: 0,
    visibleColumnStopIndex: 0,
    visibleRowStartIndex: 0,
    visibleRowStopIndex: 0,
  });

  (window as any).a = () => setStickyItemIds(['0:1']);

  const getValuesToUpdate: TimelineContextValue['getValuesToUpdate'] = useCallback(
    (event, action) => {
      if (!event.target) {
        return null;
      }

      const targetBox = event.target.getBoundingClientRect();
      const outerElement = outerRef.current?.getBoundingClientRect() || {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };

      const scrollLeft = outerRef.current?.scrollLeft || 0;
      const scrollTop = outerRef.current?.scrollTop || 0;

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
        const top = event.clientY + scrollTop - outerElement.top;

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

  const upsertItem = useCallback<UpsertItem<I>>(
    item => {
      const row = Array.from(rowMap.values()).find(
        ({ group }) => group.id === item.groupId
      );

      if (!row) {
        throw new Error(`Unable to find group with id ${item.groupId}`);
      }

      const previous = itemMap.get(item.id);
      if (previous && item.groupId !== previous.groupId) {
        previous.row.removeItem(item);
      }

      row.addItem(item);
      itemMap.set(
        item.id,
        Object.assign(item, {
          end: snapTime(item.end, snapDuration),
          groupId: row.group.id,
          row,
          start: snapTime(item.start, snapDuration),
        })
      );
      gridRef.current?.resetAfterRowIndex(
        Math.min(row.index, previous?.row.index || row.index)
      );
    },
    [itemMap, rowMap, snapDuration]
  );

  const rowCount = groups.length;
  const columnCount = intervals.length;
  const columnWidth = useCallback(
    index => (index === 0 ? intervalWidth + sidebarWidth : intervalWidth),
    [intervalWidth, sidebarWidth]
  );
  const rowHeight = useCallback(
    (rowIndex: number) =>
      rowMap.get(rowIndex)?.height || minGroupHeight || itemHeight,
    [rowMap, minGroupHeight, itemHeight]
  );

  const initialScrollX = !initialScrollTime
    ? initialScrollLeft
    : Math.max(
        0,
        getPositionAtTime(
          initialScrollTime,
          startTime,
          intervalDuration,
          intervalWidth,
          sidebarWidth
        ) - sidebarWidth
      );

  const ColumnRenderer = useMemo(
    () => (columnRenderer ? memo(columnRenderer, areEqual) : undefined),
    [columnRenderer]
  );

  const GroupRenderer = useMemo(
    () => (groupRenderer ? memo(groupRenderer, areEqual) : undefined),
    [groupRenderer]
  );

  const ItemRenderer = useMemo(() => memo(itemRenderer, areEqual), [
    itemRenderer,
  ]);

  const RowRenderer = useMemo(
    () => (rowRenderer ? memo(rowRenderer, areEqual) : undefined),
    [rowRenderer]
  );

  const SidebarHeaderRenderer = useMemo(
    () => memo(sidebarHeaderRenderer, areEqual),
    [sidebarHeaderRenderer]
  );

  const SidebarRenderer = useMemo(() => memo(sidebarRenderer, areEqual), [
    sidebarRenderer,
  ]);

  const TimebarHeaderRenderer = useMemo(
    () =>
      timebarHeaderRenderer ? memo(timebarHeaderRenderer, areEqual) : undefined,
    [timebarHeaderRenderer]
  );

  const TimebarIntervalRenderer = useMemo(
    () =>
      timebarIntervalRenderer
        ? memo(timebarIntervalRenderer, areEqual)
        : undefined,
    [timebarIntervalRenderer]
  );

  const OuterElementRenderer = useMemo(
    () =>
      memo(
        forwardRef<HTMLDivElement, { style: CSSProperties }>((props, ref) => (
          <div
            {...props}
            ref={ref}
            style={{
              ...props.style,
              display: 'grid',
              gridTemplateRows: `${timebarHeaderHeight}px ${timebarIntervalHeight}px 1fr`,
              gridTemplateColumns: `${sidebarWidth}px 1fr`,
            }}
          />
        )),
        areEqual
      ),
    [sidebarWidth, timebarHeaderHeight, timebarIntervalHeight]
  );

  return (
    <TimelineContext.Provider
      value={{
        ColumnRenderer,
        GroupRenderer,
        RowRenderer,
        SidebarHeaderRenderer,
        SidebarRenderer,
        TimebarHeaderRenderer,
        TimebarIntervalRenderer,
        children,
        columnCount,
        columnWidth,
        endTime,
        getValuesToUpdate,
        groups,
        height,
        intervalDuration,
        intervalWidth,
        intervals,
        itemData,
        itemMap,
        itemHeight,
        ItemRenderer,
        minItemWidth,
        outerRef,
        overscanColumnStartIndex,
        overscanColumnStopIndex,
        overscanRowStartIndex,
        overscanRowStopIndex,
        rowCount,
        rowHeight,
        rowMap,
        setStickyItemIds: handleSetStickyItemIds,
        sidebarWidth,
        snapDuration,
        startTime,
        stickyItemIds,
        timebarHeaderHeight,
        timebarHeight,
        timebarIntervalHeight,
        upsertItem: upsertItem as TimelineContextValue['upsertItem'],
        visibleColumnStartIndex,
        visibleColumnStopIndex,
        visibleRowStartIndex,
        visibleRowStopIndex,
        width,
      }}
    >
      <VariableSizeGrid
        {...gridProps}
        ref={gridRef}
        width={width}
        height={height}
        columnCount={columnCount}
        columnWidth={columnWidth}
        estimatedColumnWidth={intervalWidth}
        innerElementType={innerElementType}
        outerElementType={OuterElementRenderer}
        onItemsRendered={setVisibleArea}
        outerRef={outerRef}
        rowCount={Math.max(rowCount, 1)}
        rowHeight={rowHeight}
        initialScrollLeft={initialScrollX}
      >
        {noopRenderer}
      </VariableSizeGrid>
    </TimelineContext.Provider>
  );
}

const noopRenderer = () => null;
