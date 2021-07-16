/* import { useVisibleArea } from "./use-visible-area"; */

/* import { */
/*   DataNode, */
/*   Item, */
/*   TimelineColumn, */
/*   TimelineItem, */
/*   TimelineControl, */
/*   TimelineInterval, */
/* } from "../interfaces"; */
/* import { useTimelineControl } from "./use-timeline-control"; */
/* import { useHierarchy } from "./use-hierarchy"; */
/* import { useIntervals } from "./use-intervals"; */
/* import { TimelineHierarchy } from "../timeline-hierarchy"; */


/* export interface UseTimeline { */
/*   control: TimelineControl; */
/*   columns: TimelineColumn[]; */
/*   items: TimelineItem[]; */
/*   hierarchy: TimelineHierarchy; */

/*   intervals: TimelineInterval[]; */
/* } */

/* export function useTimeline(userOptions: UseTimelineOptions): UseTimeline { */
/*   const options: Required<UseTimelineOptions> = { */
/*     snapDuration: 1000 * 60, // 1 minute */
/*     paddingLeft: 0, */
/*     paddingRight: 0, */
/*     paddingTop: 0, */
/*     paddingBottom: 0, */

/*     initialScrollTime: userOptions.startTime, */

/*     minItemWidth: 10, */
/*     itemHeight: 50, */

/*     minGroupHeight: 60, */
/*     groupTopPadding: 0, */
/*     groupBottomPadding: 0, */
/*     ...userOptions, */
/*   }; */

/*   const { startTime, intervals } = useIntervals(options); */

/*   const { rows, hierarchy } = useHierarchy(options); */

/*   const { */
/*     onItemsRendered, */
/*     columns, */
/*     items: visibleItems, */
/*     intervals: visibleIntervals, */
/*   } = useVisibleArea({ */
/*     ...options, */
/*     rows, */
/*     intervals, */
/*     startTime, */
/*   }); */

/*   const timelineControl = useTimelineControl({ */
/*     ...options, */
/*     rows, */
/*     intervals, */
/*     onItemsRendered: onItemsRendered, */
/*   }); */

/*   // const resetAfterRow = useCallback( */
/*   //   (id: DataNode["id"]) => { */
/*   //     const dataNode = findVisibleDataNode(id, [ */
/*   //       ...flattenHierarchy(hierarchy, expandedKeys), */
/*   //     ]); */

/*   //     const rowIndex = dataNode */
/*   //       ? rows.findIndex((row) => row.leafNodeId === dataNode.id) */
/*   //       : -1; */

/*   //     if (rowIndex > 0) { */
/*   //       gridRef.current?.resetAfterRowIndex(rowIndex); */
/*   //     } */
/*   //   }, */
/*   //   [hierarchy, rows, expandedKeys] */
/*   // ); */

/*   // const dataAtCursor = useCallback<TimelineState["dataAtCursor"]>( */
/*   //   (event) => { */
/*   //     // if (!event.currentTarget) { */
/*   //     //   return null; */
/*   //     // } */

/*   //     const outerElement = outerRef.current?.getBoundingClientRect() || { */
/*   //       left: 0, */
/*   //       right: 0, */
/*   //       top: 0, */
/*   //       bottom: 0, */
/*   //     }; */

/*   //     var mouseLeft = event.clientX; */
/*   //     var mouseTop = event.clientY; */

/*   //     const scrollLeft = outerRef.current?.scrollLeft || 0; */
/*   //     const scrollTop = outerRef.current?.scrollTop || 0; */

/*   //     const left = mouseLeft + scrollLeft - outerElement.left - sidebarWidth; */
/*   //     const top = mouseTop + scrollTop - outerElement.top - timebarHeight; */

/*   //     const row = rows.find((row) => { */
/*   //       return row.top <= top && row.top + row.height >= top; */
/*   //     }); */

/*   //     const time = Math.max( */
/*   //       startTime, */
/*   //       getTimeAtPosition( */
/*   //         left, */
/*   //         startTime, */
/*   //         intervalDuration, */
/*   //         intervalWidth, */
/*   //         snapDuration */
/*   //       ) */
/*   //     ); */

/*   //     return { */
/*   //       time, */
/*   //       nodeId: row?.leafNodeId, */
/*   //       suggestedNodeId: rows[top > 0 ? rows.length - 1 : 0].leafNodeId, */
/*   //     }; */
/*   //   }, */
/*   //   [outerRef, rows] */
/*   // ); */

/*   // const getUpdatedItem = getUpdatedItemCallback({ */
/*   //   ...options, */
/*   //   startTime, */
/*   //   endTime, */
/*   //   outerRef, */
/*   //   rows, */
/*   //   timebarHeight, */
/*   //   intervalDuration, */
/*   //   intervalWidth, */
/*   //   snapDuration, */
/*   // }); */

/*   return { */
/*     columns: columns, */
/*     control: timelineControl, */
/*     hierarchy, */
/*     intervals: visibleIntervals, */
/*     items: visibleItems, */
/*   }; */
/* } */
