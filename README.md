# react-window-timeline

A modern and responsive headless React timeline component.

This library provides the core virtualization engine needed for your timeline, the appearance and behaviors are left to you.

For an example on how to setup drag&drop, resizing and auto-scrolling please see the example folder.

> This library is under active development, its API is currently unstable.

## Examples

https://marklawlor.github.io/react-window-timeline/

## Usage

```jsx
import Timeline from 'react-window-timeline';

export default function MyTimeline() {
  const startTime = Date().now();
  const endTime = startTime + 1000 * 60 * 60 * 24; // 1 Day
  const intervalDuration = 1000 * 60 * 60; // 1 hour

  const groups = useMemo(() => randomGroups(), []);
  const items = useMemo(() => randomItems(), [])

  return (
    <Timeline
      startTime={startTime}
      endTime={endTime}
      width={1000}
      height={1000}
      intervalDuration={intervalDuration}
      intervalWidth={100}
      items={items}
      groups={groups}
      itemRenderer={({ style }) => <div style={{ ...style, background: 'red' }} >}
      columnRenderer={({ style }) => <div style={{ ...style, background: 'rgba(0, 0, 0, 0.5)' }} >}
    />
  );
}
```

This will render you a very boring looking timeline. For something more interesting try

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
