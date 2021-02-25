import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useContext,
} from 'react';
import mergeRefs from 'react-merge-refs';

import range from './utils/range';
import TimelineContext from './context';
import { getPositionAtTime } from './utils/time';

export default forwardRef<HTMLDivElement, { style: CSSProperties }>(
  function TimelineInner({ children, style, ...props }, ref) {
    const {
      GroupRenderer,
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
      TimebarIntervalRenderer,
      TimebarHeaderRenderer,
      SidebarHeaderRenderer,
      RowRenderer,
      ColumnRenderer,
      timebarHeaderHeight,
      timebarIntervalHeight,
      timebarHeight,
      overscanRowStopIndex,
      overscanRowStartIndex,
      overscanColumnStartIndex,
      overscanColumnStopIndex,
      width,
    } = useContext(TimelineContext);

    const rows = range(overscanRowStopIndex - overscanRowStartIndex + 1).map(
      rowIndex => rowMap.get(rowIndex + overscanRowStartIndex)!
    );

    const columns = range(
      overscanColumnStartIndex,
      overscanColumnStopIndex + 1
    );

    const measureScrollbarWidth = useCallback(innerElement => {
      if (!innerElement) {
        return;
      }
      const outerElement = innerElement.parentElement;

      const scrollbarWidth =
        outerElement.offsetWidth - outerElement.clientWidth;

      document.documentElement.style.setProperty(
        '--rwt-inner-element-scrollbar-width',
        `${scrollbarWidth}px`
      );
    }, []);

    return (
      <div
        ref={mergeRefs([ref, measureScrollbarWidth])}
        style={{
          ...style,
          whiteSpace: 'nowrap',
        }}
        {...props}
      >
        {timebarHeaderHeight > 0 && TimebarHeaderRenderer && (
          <>
            <TimebarHeaderRenderer
              key="timebar:head"
              style={{
                position: 'sticky',
                display: 'inline-block',
                verticalAlign: 'bottom',
                boxSizing: 'border-box',
                width: `calc(${width}px - var(--rwt-inner-element-scrollbar-width, 0px))`,
                top: 0,
                left: 0,
                right: 0,
                height: timebarHeaderHeight,
                zIndex: 3,
              }}
            />
            <div key="timebar:head:line-break" />
          </>
        )}

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
            zIndex: 4,
            marginLeft: overscanColumnStartIndex * intervalWidth,
          }}
        />

        {columns.flatMap(column => [
          ColumnRenderer && (
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
                height: rowMap.get(groups.length - 1)!.bottom,
                zIndex: 0,
              }}
            />
          ),
          TimebarIntervalRenderer && (
            <TimebarIntervalRenderer
              key={`timebar_interval:${column}`}
              isOdd={column % 2 === 1}
              isEven={column % 2 === 0}
              time={startTime + intervalDuration * column}
              style={{
                position: 'sticky',
                display: 'inline-block',
                boxSizing: 'border-box',
                width: intervalWidth,
                top: timebarHeaderHeight,
                height: timebarIntervalHeight,
                zIndex: 3,
                verticalAlign: 'top',
              }}
            />
          ),
        ])}

        <div
          key="row:margin"
          style={{
            position: 'sticky',
            boxSizing: 'border-box',
            display: 'block',
            marginTop: rowMap.get(overscanRowStartIndex)!.top - timebarHeight,
            verticalAlign: 'bottom',
            pointerEvents: 'none',
          }}
        />

        {rows.flatMap(row => {
          return [
            sidebarWidth > 0 && GroupRenderer && (
              <GroupRenderer
                key={`group:${row.index}`}
                rowIndex={row.index}
                group={row.group}
                isOdd={row.index % 2 === 1}
                isEven={row.index % 2 === 0}
                style={{
                  position: 'sticky',
                  display: 'inline-block',
                  verticalAlign: 'bottom',
                  boxSizing: 'border-box',
                  width: sidebarWidth,
                  height: row.height,
                  left: 0,
                  zIndex: 2,
                }}
              />
            ),

            sidebarWidth > 0 && GroupRenderer && (
              <div key={`group:${row.index}:line-break`} />
            ),

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
                  zIndex: 0,
                }}
              />
            ),

            ...row
              .getItemsByIntervalRange(
                overscanColumnStartIndex,
                overscanColumnStopIndex
              )
              .map(item => {
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

                const top =
                  row.top + item.row.getItemTopOffset(item, itemHeight);

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
                      zIndex: 1,
                    }}
                  />
                );
              }),
          ];
        })}
      </div>
    );
  }
);
