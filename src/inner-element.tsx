import React, {
  CSSProperties,
  forwardRef,
  ReactElement,
  useContext,
} from 'react';
import range from './utils/range';
import TimelineContext from './context';
import { getPositionAtTime } from './utils/time';
import { Item } from './timeline-data';

export default forwardRef<HTMLDivElement, { style: CSSProperties }>(
  function TimelineInner({ children, style, ...props }, ref) {
    const {
      ColumnRenderer,
      GroupRenderer,
      ItemRenderer,
      RowRenderer,
      SidebarHeaderRenderer,
      TimebarHeaderRenderer,
      TimebarIntervalRenderer,
      children: childrenFromProps,
      height,
      groups,
      intervalDuration,
      intervalWidth,
      intervals,
      itemHeight,
      itemMap,
      minItemWidth,
      overscanColumnStartIndex,
      overscanColumnStopIndex,
      overscanRowStartIndex,
      overscanRowStopIndex,
      rowMap,
      sidebarWidth,
      startTime,
      stickyItemIds,
      timebarHeaderHeight,
      timebarHeight,
      timebarIntervalHeight,
    } = useContext(TimelineContext);

    const stickyItems = stickyItemIds.map(id => itemMap.get(id)!);
    const stickyRows = stickyItems.map(item => item.row);

    const rangeCount =
      groups.length > 0 ? overscanRowStopIndex - overscanRowStartIndex + 1 : 0;

    const rows = Array.from(
      new Set([
        ...stickyRows,
        ...range(rangeCount).map(
          rowIndex => rowMap.get(rowIndex + overscanRowStartIndex)!
        ),
      ])
    ).sort((a, b) => a.index - b.index);

    const columns = range(
      overscanColumnStartIndex,
      overscanColumnStopIndex + 1
    );

    return (
      <>
        {timebarHeaderHeight > 0 && TimebarHeaderRenderer && (
          <TimebarHeaderRenderer
            key="timebar:head"
            style={{
              position: 'sticky',
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 'auto',
              top: 0,
              left: 0,
              display: 'inline-flex',
              height: timebarHeaderHeight,
              boxSizing: 'border-box',
              zIndex: 3,
            }}
          />
        )}

        <div
          style={{
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: '100%',
            whiteSpace: 'nowrap',
            position: 'sticky',
            boxSizing: 'border-box',
            height: timebarIntervalHeight,
            top: timebarHeaderHeight,
            flexDirection: 'column',
            zIndex: 3,
          }}
        >
          <SidebarHeaderRenderer
            key="sidebar:header"
            style={{
              position: 'sticky',
              display: 'inline-block',
              verticalAlign: 'bottom',
              boxSizing: 'border-box',
              top: timebarHeaderHeight,
              left: 0,
              height: timebarIntervalHeight,
              width: sidebarWidth,
              zIndex: 1,
              marginLeft: overscanColumnStartIndex * intervalWidth,
              overflow: 'visible',
            }}
          />

          {columns.flatMap(column => [
            TimebarIntervalRenderer && (
              <TimebarIntervalRenderer
                key={`timebar_interval:${column}`}
                isOdd={column % 2 === 1}
                isEven={column % 2 === 0}
                time={startTime + intervalDuration * column}
                style={{
                  position: 'sticky',
                  display: 'inline-flex',
                  boxSizing: 'border-box',
                  width: intervalWidth,
                  top: timebarHeaderHeight,
                  height: timebarIntervalHeight,
                  verticalAlign: 'top',
                }}
              />
            ),
          ])}
        </div>

        <div
          style={{
            height: 0,
            position: 'sticky',
            top: timebarHeight,
          }}
        >
          {ColumnRenderer &&
            columns.map(column => (
              <ColumnRenderer
                key={`column:${column}`}
                isOdd={column % 2 === 1}
                isEven={column % 2 === 0}
                time={startTime + intervalDuration * column}
                style={{
                  position: 'absolute',
                  boxSizing: 'border-box',
                  top: 0,
                  left: sidebarWidth + intervalWidth * column,
                  width: intervalWidth,
                  height: height,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            ))}
        </div>

        <div
          ref={ref}
          {...props}
          style={{
            ...style,
            whiteSpace: 'nowrap',
            flex: '1 0 auto',
          }}
        >
          <div
            key="row:margin"
            style={{
              boxSizing: 'border-box',
              marginTop:
                (rowMap.get(overscanRowStartIndex)?.top ?? timebarHeight) -
                timebarHeight,
              pointerEvents: 'none',
            }}
          />

          {rows.flatMap(row => {
            const rowStickyItems = stickyItems.filter(
              item => item.groupId === row.group.id
            );

            const isStickyRow =
              row.index < overscanRowStartIndex ||
              row.index > overscanRowStopIndex;

            function renderItem(item: Item): ReactElement {
              const left = getPositionAtTime(
                item.start,
                startTime,
                intervalDuration,
                intervalWidth,
                sidebarWidth
              );

              const width = Math.max(
                getPositionAtTime(
                  item.end,
                  startTime,
                  intervalDuration,
                  intervalWidth,
                  sidebarWidth
                ) - left,
                minItemWidth
              );

              const top = row.top + row.getItemTopOffset(item, itemHeight);

              const isStickyItem = rowStickyItems.some(
                ({ id }) => id === item.id
              );

              return (
                <ItemRenderer
                  key={item.id}
                  item={item as any}
                  style={{
                    position: 'absolute',
                    boxSizing: 'border-box',
                    left,
                    top,
                    width,
                    height: itemHeight,
                    zIndex: isStickyItem ? 1 : 0,
                  }}
                />
              );
            }

            // Only render the items if this is a sticky row
            if (isStickyRow) {
              return rowStickyItems.map(item => renderItem(item));
            }

            const items = Array.from(
              new Set([
                ...rowStickyItems,
                ...row.getItemsByIntervalRange(
                  overscanColumnStartIndex,
                  overscanColumnStopIndex
                ),
              ])
            );

            return [
              RowRenderer && (
                <RowRenderer
                  key={`row:${row.index}`}
                  rowIndex={row.index}
                  group={row.group}
                  isOdd={row.index % 2 === 1}
                  isEven={row.index % 2 === 0}
                  style={{
                    position: 'absolute',
                    boxSizing: 'border-box',
                    top: row.top,
                    left: 0,
                    height: row.height,
                    width: intervals.length * intervalWidth + sidebarWidth,
                    zIndex: -1,
                  }}
                />
              ),
              ...items.map(item => renderItem(item)),
              sidebarWidth > 0 && GroupRenderer && (
                <GroupRenderer
                  key={`group:${row.index}`}
                  rowIndex={row.index}
                  group={row.group}
                  isOdd={row.index % 2 === 1}
                  isEven={row.index % 2 === 0}
                  style={{
                    position: 'sticky',
                    display: 'block',
                    verticalAlign: 'bottom',
                    boxSizing: 'border-box',
                    width: sidebarWidth,
                    height: row.height,
                    left: 0,
                  }}
                />
              ),
            ];
          })}

          {childrenFromProps}
        </div>
      </>
    );
  }
);
