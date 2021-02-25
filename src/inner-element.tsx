import React, {
  CSSProperties,
  forwardRef,
  ReactElement,
  useCallback,
  useContext,
} from 'react';
import mergeRefs from 'react-merge-refs';

import range from './utils/range';
import TimelineContext from './context';
import { getPositionAtTime } from './utils/time';
import { Item } from './timeline-data';

export default forwardRef<HTMLDivElement, { style: CSSProperties }>(
  function TimelineInner({ children, style, ...props }, ref) {
    const {
      ColumnRenderer,
      GroupRenderer,
      RowRenderer,
      SidebarHeaderRenderer,
      TimebarHeaderRenderer,
      TimebarIntervalRenderer,
      groups,
      intervalDuration,
      intervalWidth,
      intervals,
      itemHeight,
      ItemRenderer,
      minItemWidth,
      overscanColumnStartIndex,
      overscanColumnStopIndex,
      overscanRowStartIndex,
      overscanRowStopIndex,
      itemMap,
      rowMap,
      sidebarWidth,
      startTime,
      stickyItemIds,
      timebarHeaderHeight,
      timebarHeight,
      timebarIntervalHeight,
      width,
    } = useContext(TimelineContext);

    const stickyItems = stickyItemIds.map(id => itemMap.get(id)!);
    const stickyRows = stickyItems.map(item => item.row);

    const rows = Array.from(
      new Set([
        ...stickyRows,
        ...range(overscanRowStopIndex - overscanRowStartIndex + 1).map(
          rowIndex => rowMap.get(rowIndex + overscanRowStartIndex)!
        ),
      ])
    ).sort((a, b) => a.index - b.index);

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
          }

          const rowStickyItems = stickyItems.filter(
            item => item.groupId === row.group.id
          );

          const isSticky =
            row.index < overscanRowStartIndex ||
            row.index > overscanRowStopIndex;

          if (isSticky) {
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

            ...items.map(item => renderItem(item)),
          ];
        })}
      </div>
    );
  }
);
