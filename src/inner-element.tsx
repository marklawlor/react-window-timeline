import React, {
  CSSProperties,
  forwardRef,
  ReactElement,
  useContext,
} from 'react';
import { rangeInclusive } from './utils/range';
import TimelineContext from './context';
import { getPositionAtTime } from './utils/time';
import { ChildGroup, Item } from './timeline-data';
import { eachDayOfInterval } from 'date-fns';

export default forwardRef<HTMLDivElement, { style: CSSProperties }>(
  function TimelineInner({ style }, ref) {
    const {
      BodyRenderer,
      ColumnRenderer,
      GroupRenderer,
      ItemRenderer,
      RowRenderer,
      SidebarHeaderRenderer,
      SidebarRenderer,
      TimebarHeaderRenderer,
      TimebarIntervalRenderer,
      children: childrenFromProps,
      intervalDuration,
      intervalWidth,
      itemHeight,
      itemMap,
      minItemWidth,
      overscanColumnStartIndex,
      overscanColumnStopIndex,
      overscanRowStartIndex,
      overscanRowStopIndex,
      rowMap,
      collectionSidebarWidth,
      groupSidebarWidth,
      startTime,
      endTime,
      stickyItemIds,
      timebarHeaderHeight,
      timebarIntervalHeight,
    } = useContext(TimelineContext);

    const stickyItems = stickyItemIds.map(id => itemMap.get(id)!);
    const stickyRows = stickyItems.map(item => item.row);

    const visibleRows =
      rowMap.size > 0
        ? rangeInclusive(overscanRowStartIndex, overscanRowStopIndex).map(
            rowIndex => rowMap.get(rowIndex)!
          )
        : [];

    const visibleCollections = new Set(visibleRows.map(row => row.collection));

    const sidebarWidth = collectionSidebarWidth + groupSidebarWidth;
    const timebarHeight = timebarHeaderHeight + timebarIntervalHeight;

    const rows = Array.from(new Set([...stickyRows, ...visibleRows])).sort(
      (a, b) => a.index - b.index
    );

    const columns = rangeInclusive(
      overscanColumnStartIndex,
      overscanColumnStopIndex
    );

    const days = eachDayOfInterval({
      start: startTime,
      end: endTime - 1,
    });

    return (
      <>
        {childrenFromProps}

        {ColumnRenderer && (
          <div
            style={{
              gridArea: '3 / 1 / 4 / 4',
              position: 'sticky',
              top: timebarHeight,
            }}
          >
            {columns.map(column => (
              <ColumnRenderer
                key={`column:${column}`}
                isOdd={column % 2 === 1}
                isEven={column % 2 === 0}
                time={startTime + intervalDuration * column}
                style={{
                  position: 'absolute',
                  boxSizing: 'border-box',
                  top: 0,
                  left: intervalWidth * column + sidebarWidth,
                  width: intervalWidth,
                  bottom: 0,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>
        )}

        {RowRenderer && (
          <div
            style={{
              gridArea: '3 / 2 / 4 / 4',
              position: 'sticky',
              left: 0,
              marginTop: visibleRows[0]?.top || 0,
              minWidth: style.width,
            }}
          >
            {visibleRows.flatMap(row => (
              <RowRenderer
                key={`row:${row.index}`}
                rowIndex={row.index}
                group={row.group}
                isOdd={row.index % 2 === 1}
                isEven={row.index % 2 === 0}
                style={{
                  position: 'sticky',
                  display: 'block',
                  boxSizing: 'border-box',
                  height: row.height,
                  left: 0,
                }}
              />
            ))}
          </div>
        )}

        <BodyRenderer
          ref={ref}
          style={{
            whiteSpace: 'nowrap',
            gridArea: '3 / 3 / 3 / 4',
            position: 'relative',
            minHeight: style.height,
            minWidth: style.width,
          }}
        >
          {rows.map(row => {
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
                intervalWidth
              );

              const width = Math.max(
                getPositionAtTime(
                  item.end,
                  startTime,
                  intervalDuration,
                  intervalWidth
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
                    userSelect: 'none',
                  }}
                />
              );
            }

            // Only render the items if this is a sticky row
            if (isStickyRow) {
              return rowStickyItems.map(item => renderItem(item));
            }

            return Array.from(
              new Set([
                ...rowStickyItems,
                ...row.getItemsByIntervalRange(
                  overscanColumnStartIndex,
                  overscanColumnStopIndex
                ),
              ])
            ).map(item => renderItem(item));
          })}
        </BodyRenderer>

        <SidebarRenderer
          style={{
            gridArea: '1 / 1 / 4 / 2',
            position: 'sticky',
            left: 0,
            minHeight: style.height,
            paddingTop:
              (visibleRows[0]?.top || 0) +
              timebarIntervalHeight * 2 +
              timebarHeaderHeight,
            boxSizing: 'border-box',
          }}
        >
          {Array.from(visibleCollections.values()).map(collection => {
            return [
              collectionSidebarWidth > 0 && GroupRenderer && (
                <GroupRenderer
                  key={`group:${collection.index}`}
                  group={(collection as unknown) as ChildGroup}
                  rowIndex={collection.index}
                  isOdd={collection.index % 2 === 1}
                  isEven={collection.index % 2 === 0}
                  style={{
                    position: 'sticky',
                    display: 'block',
                    boxSizing: 'border-box',
                    width: '100%',
                    height: collection.rows.reduce((acc, row) => {
                      return acc + row.height;
                    }, 0),
                    left: 0,
                    userSelect: 'none',
                  }}
                />
              ),
            ];
          })}
        </SidebarRenderer>

        <SidebarRenderer
          style={{
            gridArea: '1 / 2 / 4 / 3',
            position: 'sticky',
            minHeight: style.height,
            left: collectionSidebarWidth,
            paddingTop:
              (visibleRows[0]?.top || 0) +
              timebarIntervalHeight * 2 +
              timebarHeaderHeight,
            boxSizing: 'border-box',
          }}
        >
          {visibleRows.flatMap(row => {
            return [
              groupSidebarWidth > 0 && GroupRenderer && (
                <GroupRenderer
                  key={`group:${row.index}`}
                  rowIndex={row.index}
                  group={row.group}
                  isOdd={row.index % 2 === 1}
                  isEven={row.index % 2 === 0}
                  style={{
                    position: 'sticky',
                    display: 'block',
                    boxSizing: 'border-box',
                    width: '100%',
                    height: row.height,
                    left: 0,
                    userSelect: 'none',
                  }}
                />
              ),
            ];
          })}
        </SidebarRenderer>

        <div
          style={{
            whiteSpace: 'nowrap',
            position: 'sticky',
            boxSizing: 'border-box',
            top: timebarHeaderHeight,
            gridArea: '2 / 1 / 3 / 4',
            overflow: 'visible',
          }}
        >
          <span style={{ marginLeft: sidebarWidth }}></span>
          {days.map((day, index) => {
            if (!TimebarIntervalRenderer) {
              return null;
            }

            return (
              <TimebarIntervalRenderer
                key={`timebar_interval:${day}`}
                isOdd={index % 2 === 1}
                isEven={index % 2 === 0}
                time={day.getTime()}
                isDay
                style={{
                  display: 'inline-flex',
                  boxSizing: 'border-box',
                  width:
                    ((1000 * 60 * 60 * 24) / intervalDuration) * intervalWidth,
                  top: timebarHeaderHeight,
                  height: timebarIntervalHeight,
                  verticalAlign: 'top',
                  userSelect: 'none',
                }}
              />
            );
          })}
          <br />
          <span
            style={{ marginLeft: columns[0] * intervalWidth + sidebarWidth }}
          ></span>
          {columns.flatMap(column => [
            TimebarIntervalRenderer && (
              <TimebarIntervalRenderer
                key={`timebar_interval:${column}`}
                isOdd={column % 2 === 1}
                isEven={column % 2 === 0}
                time={startTime + intervalDuration * column}
                isDay={false}
                style={{
                  position: 'sticky',
                  display: 'inline-flex',
                  boxSizing: 'border-box',
                  width: intervalWidth,
                  top: timebarHeaderHeight,
                  height: timebarIntervalHeight,
                  verticalAlign: 'top',
                  userSelect: 'none',
                }}
              />
            ),
          ])}
        </div>

        <SidebarHeaderRenderer
          key="sidebar:header"
          style={{
            position: 'sticky',
            boxSizing: 'border-box',
            top: timebarHeaderHeight,
            left: 0,
            gridArea: '2 / 1 / 3 / 3',
          }}
        />

        {timebarHeaderHeight > 0 && TimebarHeaderRenderer && (
          <TimebarHeaderRenderer
            key="timebar:head"
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 3,
              gridArea: '1 / 1 / 2 / 4',
            }}
          />
        )}
      </>
    );
  }
);
