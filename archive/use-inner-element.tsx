/* import React, { */
/*   CSSProperties, */
/*   forwardRef, */
/*   ReactElement, */
/*   useCallback, */
/* } from "react"; */

/* import { Item, TimelineProps } from "./interfaces"; */

/* import { rangeInclusive } from "./utils/range"; */
/* import { getPositionAtTime } from "./utils/time"; */
/* import { eachDayOfInterval } from "./utils/each-day-of-interval"; */
/* import { Row } from "./row"; */

/* const defaultRenderer = ({ style, children }: any) => ( */
/*   <div style={style}>{children}</div> */
/* ); */

/* export function useInnerElement({ */
/*   state, */
/*   children, */
/*   bodyRenderer: BodyRenderer = defaultRenderer, */
/*   columnRenderer: ColumnRenderer = defaultRenderer, */
/*   itemRenderer: ItemRenderer = defaultRenderer, */
/*   /1* groupRenderer: GroupRenderer, *1/ */
/*   rowRenderer: RowRenderer = defaultRenderer, */
/*   /1* sidebarRenderer: SidebarRenderer, *1/ */
/*   sidebarHeaderRenderer: SidebarHeaderRenderer = defaultRenderer, */
/*   timebarHeaderRenderer: TimebarHeaderRenderer = defaultRenderer, */
/*   timebarIntervalRenderer: TimebarIntervalRenderer = defaultRenderer, */
/* }: TimelineProps) { */
/*   const { */
/*     startTime, */
/*     endTime, */

/*     itemHeight, */

/*     intervals, */
/*     intervalDuration, */
/*     intervalWidth, */

/*     overscanRowStartIndex, */
/*     overscanRowStopIndex, */
/*     overscanColumnStartIndex, */
/*     overscanColumnStopIndex, */
/*   } = state; */

/*   return useCallback( */
/*     forwardRef<HTMLDivElement, { style: CSSProperties }>(({ style }, ref) => { */
/*       const visibleRows = state.rows.slice( */
/*         overscanRowStartIndex, */
/*         overscanRowStopIndex + 1 // Need to include the +1 as slice does not include the end */
/*       ); */

/*       const stickyRows: Row[] = []; */
/*       const minItemWidth = 10; */

/*       const sidebarWidth = 100; */
/*       /1* const groupSidebarWidth = 50; *1/ */
/*       /1* const collectionSidebarWidth = 50; *1/ */

/*       const timebarHeight = 100; */
/*       const timebarHeaderHeight = 50; */
/*       const timebarIntervalHeight = 50; */

/*       const rows = Array.from(new Set([...stickyRows, ...visibleRows])).sort( */
/*         (a, b) => a.index - b.index */
/*       ); */

/*       const columns = rangeInclusive( */
/*         overscanColumnStartIndex, */
/*         overscanColumnStopIndex */
/*       ); */

/*       const days = eachDayOfInterval({ */
/*         start: startTime, */
/*         end: endTime - 1, */
/*       }); */

/*       return ( */
/*         <> */
/*           {children} */

/*           {ColumnRenderer && ( */
/*             <div */
/*               id="columns" */
/*               style={{ */
/*                 gridArea: "3 / 1 / 4 / 4", */
/*                 position: "sticky", */
/*                 top: timebarHeight, */
/*               }} */
/*             > */
/*               {columns.map((column) => ( */
/*                 <ColumnRenderer */
/*                   key={`column:${column}`} */
/*                   index={column} */
/*                   time={startTime + intervalDuration * column} */
/*                   left={intervalWidth * column + sidebarWidth} */
/*                   width={intervalWidth} */
/*                 /> */
/*               ))} */
/*             </div> */
/*           )} */

/*           {RowRenderer && ( */
/*             <div */
/*               style={{ */
/*                 gridArea: "3 / 2 / 4 / 4", */
/*                 position: "sticky", */
/*                 left: 0, */
/*                 marginTop: visibleRows[0]?.top || 0, */
/*                 minWidth: style.width, */
/*               }} */
/*             > */
/*               {visibleRows.flatMap((row) => ( */
/*                 <RowRenderer key={`row:${row.index}`} row={row} /> */
/*               ))} */
/*             </div> */
/*           )} */

/*           <BodyRenderer */
/*             ref={ref} */
/*             style={{ */
/*               whiteSpace: "nowrap", */
/*               gridArea: "3 / 3 / 3 / 4", */
/*               position: "relative", */
/*               minHeight: style.height, */
/*               minWidth: style.width, */
/*             }} */
/*           > */
/*             {rows.map((row) => { */
/*               /1* const rowStickyItems = stickyItems.filter( *1/ */
/*               /1*   (item) => item.groupId === row.group.id *1/ */
/*               /1* ); *1/ */

/*               const isStickyRow = false; */
/*               /1* row.index < overscanRowStartIndex || *1/ */
/*               /1* row.index > overscanRowStopIndex; *1/ */

/*               function renderItem(item: Item): ReactElement { */
/*                 const left = getPositionAtTime( */
/*                   item.start, */
/*                   startTime, */
/*                   intervalDuration, */
/*                   intervalWidth */
/*                 ); */

/*                 const width = Math.max( */
/*                   getPositionAtTime( */
/*                     item.end, */
/*                     startTime, */
/*                     intervalDuration, */
/*                     intervalWidth */
/*                   ) - left, */
/*                   minItemWidth */
/*                 ); */

/*                 const top = row.top + row.getItemTopOffset(item, itemHeight); */

/*                 const isStickyItem = false; */
/*                 /1* rowStickyItems.some( *1/ */
/*                 /1*   ({ id }) => id === item.id *1/ */
/*                 /1* ); *1/ */

/*                 return ( */
/*                   <ItemRenderer */
/*                     key={item.id} */
/*                     item={item as any} */
/*                     style={{ */
/*                       position: "absolute", */
/*                       boxSizing: "border-box", */
/*                       background: "red", */
/*                       left, */
/*                       top, */
/*                       width, */
/*                       height: itemHeight, */
/*                       zIndex: isStickyItem ? 1 : 0, */
/*                       userSelect: "none", */
/*                     }} */
/*                   /> */
/*                 ); */
/*               } */

/*               // Only render the items if this is a sticky row */
/*               if (isStickyRow) { */
/*                 return; //rowStickyItems.map((item) => renderItem(item)); */
/*               } */

/*               return Array.from( */
/*                 new Set([ */
/*                   /1* ...rowStickyItems, *1/ */
/*                   ...row.getItemsByIntervalRange( */
/*                     overscanColumnStartIndex, */
/*                     overscanColumnStopIndex, */
/*                     intervals */
/*                   ), */
/*                 ]) */
/*               ).map((item) => renderItem(item)); */
/*             })} */
/*           </BodyRenderer> */

/*           <div */
/*             style={{ */
/*               whiteSpace: "nowrap", */
/*               position: "sticky", */
/*               boxSizing: "border-box", */
/*               top: timebarHeaderHeight, */
/*               gridArea: "2 / 1 / 3 / 4", */
/*               overflow: "visible", */
/*             }} */
/*           > */
/*             <span style={{ marginLeft: sidebarWidth }}></span> */
/*             {days.map((day) => { */
/*               if (!TimebarIntervalRenderer) { */
/*                 return null; */
/*               } */

/*               return ( */
/*                 <TimebarIntervalRenderer */
/*                   key={`timebar_interval:${day}`} */
/*                   time={day.getTime()} */
/*                   isDay */
/*                   style={{ */
/*                     display: "inline-flex", */
/*                     boxSizing: "border-box", */
/*                     width: */
/*                       ((1000 * 60 * 60 * 24) / intervalDuration) * */
/*                       intervalWidth, */
/*                     top: timebarHeaderHeight, */
/*                     height: timebarIntervalHeight, */
/*                     verticalAlign: "top", */
/*                     userSelect: "none", */
/*                   }} */
/*                 /> */
/*               ); */
/*             })} */
/*             <br /> */
/*             <span */
/*               style={{ marginLeft: columns[0] * intervalWidth + sidebarWidth }} */
/*             ></span> */
/*             {columns.flatMap((column) => [ */
/*               TimebarIntervalRenderer && ( */
/*                 <TimebarIntervalRenderer */
/*                   key={`timebar_interval:${column}`} */
/*                   isOdd={column % 2 === 1} */
/*                   isEven={column % 2 === 0} */
/*                   isDay={false} */
/*                   style={{ */
/*                     position: "sticky", */
/*                     display: "inline-flex", */
/*                     boxSizing: "border-box", */
/*                     width: intervalWidth, */
/*                     top: timebarHeaderHeight, */
/*                     height: timebarIntervalHeight, */
/*                     verticalAlign: "top", */
/*                     userSelect: "none", */
/*                   }} */
/*                 > */
/*                   {startTime + intervalDuration * column} */
/*                 </TimebarIntervalRenderer> */
/*               ), */
/*             ])} */
/*           </div> */

/*           <SidebarHeaderRenderer */
/*             key="sidebar:header" */
/*             style={{ */
/*               position: "sticky", */
/*               boxSizing: "border-box", */
/*               top: timebarHeaderHeight, */
/*               left: 0, */
/*               gridArea: "2 / 1 / 3 / 3", */
/*             }} */
/*           /> */

/*           {timebarHeaderHeight > 0 && TimebarHeaderRenderer && ( */
/*             <TimebarHeaderRenderer */
/*               key="timebar:head" */
/*               style={{ */
/*                 position: "sticky", */
/*                 top: 0, */
/*                 left: 0, */
/*                 zIndex: 3, */
/*                 gridArea: "1 / 1 / 2 / 4", */
/*               }} */
/*             /> */
/*           )} */
/*         </> */
/*       ); */
/*     }), */
/*     [ */
/*       startTime, */
/*       endTime, */

/*       itemHeight, */

/*       intervals, */
/*       intervalDuration, */
/*       intervalWidth, */

/*       overscanRowStartIndex, */
/*       overscanRowStopIndex, */
/*       overscanColumnStartIndex, */
/*       overscanColumnStopIndex, */
/*     ] */
/*   ); */
/* } */
