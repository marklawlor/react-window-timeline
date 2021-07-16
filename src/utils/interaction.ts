import { Item, TimelineColumn } from "../interfaces";

export enum Intersection {
  NONE,
  OUTSIDE,
  INSIDE,
  CONTAINED,
  LEFT,
  RIGHT,
}

export function getIntersection(
  item: Item | undefined,
  { start, end }: TimelineColumn
): Intersection {
  if (!item) {
    return Intersection.NONE;
  }

  if (start <= item.start && end >= item.start) {
    if (start <= item.end && end >= item.end) {
      return Intersection.CONTAINED;
    }

    return Intersection.LEFT;
  } else if (start >= item.start && end <= item.end) {
    return Intersection.INSIDE;
  } else if (start <= item.end && end >= item.end) {
    return Intersection.RIGHT;
  }

  return Intersection.OUTSIDE;
}
