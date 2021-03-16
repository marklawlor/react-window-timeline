// range 0 , 0 = []

// range 0, 1 = [{}]
// range 2, 5 = [{}, {}, {}]

export default function range(
  start: number,
  stop?: number,
  step: number = 1
): number[] {
  if (typeof stop == 'undefined') {
    // one param defined
    stop = start;
    start = 0;
  }

  if (start === stop) {
    return [];
  }

  if ((step > 0 && start > stop) || (step < 0 && start < stop)) {
    return [];
  }

  var result = [];

  for (var i = start; step > 0 ? i <= stop : i >= stop; i += step) {
    result.push(i);
  }

  return result;
}
