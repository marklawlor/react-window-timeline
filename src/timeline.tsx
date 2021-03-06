import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
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
  BodyRenderer,
  RemoveItem,
} from './context';

import innerElementType from './inner-element';

import {
  ChildGroup,
  getTimelineData,
  Item,
  ParentGroup,
} from './timeline-data';
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
  | 'removeItem'
  | 'rowCount'
  | 'rowHeight';

export interface TimelineProps
  extends Omit<VariableSizeGridProps, VariableSizeGridPropsOmitted> {
  // Required
  endTime: number;
  groups: ParentGroup[] | ChildGroup[];
  height: number;
  intervalDuration: number;
  intervalWidth: number;
  itemRenderer: ItemRenderer<any>;
  items: any[];
  startTime: number;
  width: number;

  // Optional
  bodyRenderer?: BodyRenderer;
  children?: ReactElement | null;
  columnRenderer?: ColumnRenderer;
  groupRenderer?: GroupRenderer;
  groupTopPadding?: number;
  groupBottomPadding?: number;
  initialScrollTime?: number;
  itemData?: any;
  itemHeight?: number;
  minItemWidth?: number;
  minGroupHeight?: number;
  onItemUpdate?: (item: any) => void;
  rowRenderer?: RowRenderer;
  sidebarHeaderRenderer?: SidebarHeaderRenderer;
  sidebarRenderer?: SidebarRenderer;
  collectionSidebarWidth?: number;
  groupSidebarWidth?: number;
  snapDuration?: number;
  timebarHeaderHeight?: number;
  timebarHeaderRenderer?: TimebarHeaderRenderer;
  timebarIntervalHeight?: number;
  timebarIntervalRenderer?: TimebarIntervalRenderer;
}

export default function Timeline(props: TimelineProps): ReactElement {
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
    bodyRenderer = forwardRef<HTMLDivElement>((props, ref) => (
      <div ref={ref} {...props} />
    )) as BodyRenderer,
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
    onItemUpdate = () => undefined,
    collectionSidebarWidth = 0,
    groupSidebarWidth = 0,
    snapDuration = 1000 * 60, // 1 minute
    timebarIntervalHeight = itemHeight,
    timebarHeaderHeight = 0,
    timebarHeaderRenderer,
    sidebarHeaderRenderer = props => <div {...props} />,
    sidebarRenderer = props => <div {...props} />,
    initialScrollLeft = 0,
    initialScrollTime,
    style,
    ...gridProps
  } = props;

  const gridRef = useRef<VariableSizeGrid>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  const startTime = snapTime(initialStartTime, snapDuration);
  const endTime = snapTime(initialEndTime, snapDuration);

  // Timebar = Header + Day interval + hour interval
  const timebarHeight = timebarIntervalHeight * 2 + timebarHeaderHeight;
  const sidebarWidth = collectionSidebarWidth + groupSidebarWidth;

  const intervals = useMemo(() => {
    return getIntervals(
      new Date(startTime),
      new Date(endTime),
      intervalDuration
    );
  }, [startTime, endTime, intervalDuration]);

  const [itemMap, rowMap] = useMemo(() => {
    gridRef.current?.resetAfterRowIndex(0, false);
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

  const getUpdatedItem: TimelineContextValue['getUpdatedItem'] = useCallback(
    (event, item, { action, snapToRow } = {}) => {
      if (!event.currentTarget) {
        return null;
      }

      const targetBox = event.currentTarget.getBoundingClientRect();
      const outerElement = outerRef.current?.getBoundingClientRect() || {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };

      const scrollLeft = outerRef.current?.scrollLeft || 0;
      const scrollTop = outerRef.current?.scrollTop || 0;

      const left =
        targetBox.left + scrollLeft - outerElement.left - sidebarWidth;
      const right =
        targetBox.right + scrollLeft - outerElement.left - sidebarWidth;
      const top = targetBox.top + scrollTop - outerElement.top - timebarHeight;

      const updatedValues: Item = {
        ...item,
        start: Math.max(
          startTime,
          getTimeAtPosition(
            left,
            startTime,
            intervalDuration,
            intervalWidth,
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
            snapDuration
          )
        ),
      };

      if (action !== UpdateItemAction.RESIZE) {
        const rowArray = Array.from(rowMap.values());
        const row = Array.from(rowArray).find(row => {
          return row.top <= top && row.top + row.height > top;
        });

        if (!row && !snapToRow) {
          return null;
        }

        updatedValues.groupId =
          row?.group.id ||
          rowArray[top > 0 ? rowArray.length - 1 : 0].group.id ||
          '';
      }

      return updatedValues;
    },
    [
      rowMap,
      startTime,
      endTime,
      intervalDuration,
      intervalWidth,
      sidebarWidth,
      snapDuration,
      timebarHeight,
    ]
  );

  const removeItem = useCallback<RemoveItem>(
    ({ id }) => {
      const item = itemMap.get(id);

      if (!item) {
        throw new Error('Unable to find item');
      }

      item.row.removeItem(item);
      itemMap.delete(item.id);
      onItemUpdate(item);

      gridRef.current?.resetAfterRowIndex(item.row.index);
    },
    [itemMap, onItemUpdate]
  );

  const upsertItem = useCallback<UpsertItem<any>>(
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

      const updatedItem = Object.assign(item, {
        end: snapTime(item.end, snapDuration),
        groupId: row.group.id,
        row,
        start: snapTime(item.start, snapDuration),
      });

      row.addItem(item);
      itemMap.set(item.id, updatedItem);
      onItemUpdate(item);

      gridRef.current?.resetAfterRowIndex(
        Math.min(row.index, previous?.row.index || row.index)
      );
    },
    [itemMap, rowMap, snapDuration, onItemUpdate]
  );

  const createItemAtCursor: TimelineContextValue['createItemAtCursor'] = useCallback(
    (event, { id, duration, defaultGroupId, ...rest }) => {
      if (!event.currentTarget) {
        return null;
      }

      const outerElement = outerRef.current?.getBoundingClientRect() || {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };

      var mouseLeft = event.clientX;
      var mouseTop = event.clientY;

      const scrollLeft = outerRef.current?.scrollLeft || 0;
      const scrollTop = outerRef.current?.scrollTop || 0;

      const left = mouseLeft + scrollLeft - outerElement.left - sidebarWidth;
      const top = mouseTop + scrollTop - outerElement.top - timebarHeight;

      if (top < 0) {
        return null;
      }

      const rowArray = Array.from(rowMap.values());
      const row = rowArray.find(row => {
        return row.top <= top && row.top + row.height >= top;
      });

      const start = Math.max(
        startTime,
        getTimeAtPosition(
          left,
          startTime,
          intervalDuration,
          intervalWidth,
          snapDuration
        )
      );

      const item: Item = {
        id,
        start,
        end: snapTime(start + duration, snapDuration),
        groupId:
          row?.group.id ||
          defaultGroupId ||
          rowArray[top > 0 ? rowArray.length - 1 : 0].group.id ||
          '',
        ...rest,
      };

      if (!item.groupId) {
        throw new Error('No group id provided');
      }

      upsertItem(item);

      return item;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sidebarWidth,
      timebarHeight,
      rowMap,
      startTime,
      intervalDuration,
      intervalWidth,
      snapDuration,
      upsertItem,
    ]
  );

  const BodyRenderer = bodyRenderer;
  const ColumnRenderer = columnRenderer;
  const GroupRenderer = groupRenderer;
  const ItemRenderer = itemRenderer;
  const RowRenderer = rowRenderer;
  const SidebarHeaderRenderer = sidebarHeaderRenderer;
  const SidebarRenderer = sidebarRenderer;
  const TimebarHeaderRenderer = timebarHeaderRenderer;
  const TimebarIntervalRenderer = timebarIntervalRenderer;

  const rowCount = rowMap.size;
  const columnCount = intervals.length;
  const columnWidth = useCallback(() => intervalWidth, [intervalWidth]);
  const rowHeight = useCallback(
    (rowIndex: number) => {
      return rowMap.get(rowIndex)?.height || minGroupHeight || itemHeight;
    },
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
          intervalWidth
        ) - sidebarWidth
      );

  const outerElementStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateRows: `${timebarHeaderHeight}px ${timebarIntervalHeight *
        2}px 1fr`,
      gridTemplateColumns: `${collectionSidebarWidth}px ${groupSidebarWidth}px calc(100% - ${sidebarWidth}px) 1fr`,
      ...style,
    }),
    [
      timebarHeaderHeight,
      timebarIntervalHeight,
      collectionSidebarWidth,
      groupSidebarWidth,
      sidebarWidth,
      style,
    ]
  );

  return (
    <TimelineContext.Provider
      value={{
        BodyRenderer,
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
        getUpdatedItem,
        createItemAtCursor,
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
        removeItem,
        rowCount,
        rowHeight,
        rowMap,
        setStickyItemIds: handleSetStickyItemIds,
        collectionSidebarWidth,
        groupSidebarWidth,
        snapDuration,
        startTime,
        stickyItemIds,
        timebarHeaderHeight,
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
        columnCount={columnCount}
        columnWidth={columnWidth}
        estimatedColumnWidth={intervalWidth}
        height={height}
        initialScrollLeft={initialScrollX}
        innerElementType={innerElementType}
        onItemsRendered={setVisibleArea}
        outerRef={outerRef}
        rowCount={Math.max(rowCount, 1)}
        rowHeight={rowHeight}
        style={outerElementStyle}
        width={width}
      >
        {noopRenderer}
      </VariableSizeGrid>
    </TimelineContext.Provider>
  );
}

const noopRenderer = () => null;
