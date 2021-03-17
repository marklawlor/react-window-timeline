export default function range(start: number, stop: number): number[] {
  var result = [];

  for (var i = start; i < stop; i += 1) {
    result.push(i);
  }

  return result;
}

export function rangeInclusive(start: number, stop: number): number[] {
  var result = [];

  for (var i = start; i <= stop; i += 1) {
    result.push(i);
  }

  return result;
}
