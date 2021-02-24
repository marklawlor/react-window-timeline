import React, { CSSProperties, forwardRef, useContext } from 'react';
import range from './utils/range';
import TimelineContext from './context';
import { getPositionAtTime } from './utils/time';
import { getUnmappedItem } from './timeline-data';

const stickyStyles: CSSProperties = {
  position: 'sticky',
  display: 'inline-block',
  verticalAlign: 'bottom',
  boxSizing: 'border-box',
};

export default forwardRef<HTMLDivElement, { style: CSSProperties }>(
  ({ children, style, ...props }, ref) => {
    const {
      groupRenderer: GroupRenderer,
      intervalDuration,
      intervalWidth,
      itemHeight,
      itemRenderer: ItemRenderer,
      minItemWidth,
      rowMap,
      groups,
      intervals,
      sidebarWidth,
      startTime,
      timebarIntervalRenderer: TimebarIntervalRenderer,
      timebarHeaderRenderer: TimebarHeaderRenderer,
      sidebarHeaderRenderer: SidebarHeaderRenderer,
      rowRenderer: RowRenderer,
      columnRenderer: ColumnRenderer,
      timebarHeaderHeight,
      timebarIntervalHeight,
      timebarHeight,
      visibleArea: {
        overscanRowStopIndex,
        overscanRowStartIndex,
        overscanColumnStartIndex,
        overscanColumnStopIndex,
      },
    } = useContext(TimelineContext);

    const rows = range(overscanRowStopIndex - overscanRowStartIndex + 1).map(
      rowIndex => rowMap.get(rowIndex + overscanRowStartIndex)!
    );

    return (
      <div ref={ref} style={{ ...style, whiteSpace: 'nowrap' }} {...props}>
        {timebarHeaderHeight > 0 && (
          <>
            <TimebarHeaderRenderer
              key="timebar:head"
              style={{
                ...stickyStyles,
                display: 'inline-block',
                position: 'sticky',
                top: 0,
                left: 0,
                height: timebarHeaderHeight,
                zIndex: 3,
              }}
            />
            <div key="timebar:head:line-break" />,
          </>
        )}

        <SidebarHeaderRenderer
          key="sidebar:header"
          style={{
            ...stickyStyles,
            top: timebarHeaderHeight,
            left: 0,
            height: timebarIntervalHeight,
            width: sidebarWidth,
            zIndex: 4,
            marginLeft: overscanColumnStartIndex * intervalWidth,
          }}
        />

        {range(overscanColumnStartIndex, overscanColumnStopIndex + 1).flatMap(
          column => {
            const children = [
              <TimebarIntervalRenderer
                key={`timebar_interval:${column}`}
                isOdd={column % 2 === 1}
                isEven={column % 2 === 0}
                time={startTime + intervalDuration * column}
                style={{
                  ...stickyStyles,
                  width: intervalWidth,
                  top: timebarHeaderHeight,
                  height: timebarIntervalHeight,
                  zIndex: 3,
                  verticalAlign: 'top',
                  boxSizing: 'border-box',
                }}
              />,
            ];

            if (ColumnRenderer) {
              const lastRow = rowMap.get(groups.length - 1)!;
              const containerHeight = lastRow.top + lastRow.height;

              children.unshift(
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
                    height: containerHeight,
                    zIndex: 0,
                  }}
                />
              );
            }

            return children;
          }
        )}

        <div
          key="row:margin"
          style={{
            ...stickyStyles,
            display: 'block',
            marginTop: rowMap.get(overscanRowStartIndex)!.top - timebarHeight,
            verticalAlign: 'bottom',
            pointerEvents: 'none',
          }}
        />

        {sidebarWidth > 0 && GroupRenderer
          ? rows.flatMap(row => {
              return [
                <GroupRenderer
                  key={`group:${row.index}`}
                  rowIndex={row.index}
                  group={row.group}
                  isOdd={row.index % 2 === 1}
                  isEven={row.index % 2 === 0}
                  style={{
                    ...stickyStyles,
                    width: sidebarWidth,
                    height: row.height,
                    left: 0,
                    zIndex: 2,
                  }}
                />,
                <div key={`group:${row.index}:line-break`} />,
              ];
            })
          : null}

        {rows.flatMap(row => {
          const items = row.getItemsByIntervalRange(
            overscanColumnStartIndex,
            overscanColumnStopIndex
          );

          const children = items.map(item => {
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

            const top = row.top + item.row.getItemTopOffset(item, itemHeight);

            return (
              <ItemRenderer
                key={item.id}
                item={getUnmappedItem(item)}
                style={{
                  position: 'absolute',
                  boxSizing: 'border-box',
                  left,
                  top,
                  width,
                  height: itemHeight,
                  zIndex: 1,
                }}
              />
            );
          });

          if (RowRenderer) {
            children.unshift(
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
                  zIndex: 0,
                }}
              />
            );
          }

          return children;
        })}
      </div>
    );
  }
);
