import { CSSProperties } from 'react';
import { ChildGroup, Item } from '../src/timeline-data';
import range from '../src/utils/range';

export function randomGroups(
  n: number
): Array<ChildGroup & { color: CSSProperties['backgroundColor'] }> {
  return range(0, n).map(index => ({
    id: index.toString(),
    name: `Group ${index}`,
    color: randomBackgroundColor(),
  }));
}

export function randomItems(
  groups: ChildGroup[],
  nMin: number,
  nMax: number,
  startTime: number,
  endTime: number
): Item[] {
  return groups.flatMap(group => {
    const n = Math.floor(Math.random() * nMax) + nMin;
    return range(0, n).map(index => {
      const [start, end] = [
        getRandomDate(startTime, endTime),
        getRandomDate(startTime, endTime),
      ].sort((a, b) => a - b) as [number, number];

      return {
        id: `${group.id}:${index}`,
        groupId: group.id,
        start,
        end,
      };
    });
  });
}

export function createRandomDuration(
  start: number,
  end: number
): [number, number] {
  return [getRandomDate(start, end), getRandomDate(start, end)].sort(
    (a, b) => a - b
  ) as [number, number];
}

export function getRandomDate(fromTime: number, toTime: number): number {
  return Math.round(fromTime + Math.random() * (toTime - fromTime));
}

export const getOnlyUpdatedItems = (
  allValues: Array<Item>,
  dirtyFields?: Array<Record<keyof Item, boolean>>
): Partial<Item>[] => {
  if (!dirtyFields) {
    return [];
  }

  return dirtyFields.filter(Boolean).map((dirtyFields, index) => {
    const oldItem = allValues[index];

    const entries = Object.entries(dirtyFields) as Array<[keyof Item, boolean]>;

    return Object.fromEntries([
      ['id', oldItem.id],
      ...entries.map(([field, isDirty]) => {
        if (!isDirty) {
          return [];
        }

        return [field, oldItem[field]];
      }),
    ]);
  });
};

export function randomBackgroundColor(): CSSProperties['backgroundColor'] {
  const o = Math.round;
  const r = Math.random;
  const s = 255;

  const opacity = Math.max(r(), 0.3).toFixed(1);

  return `rgba(${o(r() * s)}, ${o(r() * s)}, ${o(r() * s)}, ${opacity})`;
}
