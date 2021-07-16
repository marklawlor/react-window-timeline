export function indexBy<T, K>(
  list: T[],
  getKey: (item: T) => K
): Map<K, Set<T>> {
  const map = new Map<K, Set<T>>();
  for (const item of list) {
    const key = getKey(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, new Set([item]));
    } else {
      collection.add(item);
    }
  }

  return map;
}
