// import { useState } from "react";
// import { UseTimelineOptions } from ".";
// import { TimelineInterval } from "../interfaces";
// import { snapTime } from "../utils/time";

// export interface UseIntervals {
//   intervals: TimelineInterval[];
//   startTime: number;
//   endTime: number;
// }

// export function useIntervals({
//   startTime,
//   endTime,
//   snapDuration,
//   intervalDuration,
//   intervalWidth,
//   paddingLeft,
// }: UseTimelineOptions & {
//   snapDuration: number;
//   paddingLeft: number;
// }): UseIntervals {
//   const snappedStartTime = snapTime(startTime, snapDuration);
//   const snappedEndTime = snapTime(endTime, snapDuration);

//   const [intervals, setIntervals] = useState<TimelineInterval[]>(() =>
//     calculateIntervals(
//       startTime,
//       endTime,
//       intervalDuration,
//       intervalWidth,
//       paddingLeft
//     )
//   );

//   const [[prevStart, prevEnd, prevIntervalDuration], setPrev] = useState([
//     snappedStartTime,
//     snappedEndTime,
//     intervalDuration,
//   ]);

//   if (
//     prevStart !== snappedStartTime ||
//     prevEnd !== snappedEndTime ||
//     prevIntervalDuration !== intervalDuration
//   ) {
//     setPrev([snappedStartTime, snappedEndTime, intervalDuration]);
//     setIntervals(
//       calculateIntervals(
//         startTime,
//         endTime,
//         intervalDuration,
//         intervalWidth,
//         paddingLeft
//       )
//     );
//   }

//   return {
//     startTime: snappedStartTime,
//     endTime: snappedEndTime,
//     intervals,
//   };
// }

// function calculateIntervals(
//   startTime: number,
//   endTime: number,
//   duration: number,
//   width: number,
//   paddingLeft: number
// ) {
//   const intervals: TimelineInterval[] = [];
//   let interval = startTime;

//   while (interval < endTime) {
//     intervals.push({
//       key: `interval:${interval}`,
//       interval,
//       width,
//       left: paddingLeft + width * intervals.length,
//     });
//     interval += duration;
//   }

//   return intervals;
// }
