import React, { ReactElement, useEffect, useState } from "react";
import {
  DataAtPosition,
  Item,
  TimelineControl,
  TimelineItem as ITimelineItem,
} from "../interfaces";
import useInteractableItem from "./use-interactable-item";

export interface TimelineItemsProps {
  items: ITimelineItem[];
  control: TimelineControl;
  updateItem: (item: Item) => void;
  dataAtPosition: DataAtPosition;
  setInteractiveItem: (item: Item | undefined) => void;
}

export interface TimelineItemProps {
  item: ITimelineItem;
  control: TimelineControl;
  updateItem: (item: Item) => void;
  dataAtPosition: DataAtPosition;
  setInteractiveItem: (item: Item | undefined) => void;
}

export function TimelineItems({
  items,
  ...props
}: TimelineItemsProps): ReactElement {
  return (
    <>
      {items.map((item) => (
        <TimelineItem key={item.key} item={item} {...props} />
      ))}
    </>
  );
}

export function TimelineItem({
  item,
  control,
  updateItem,
  dataAtPosition,
  setInteractiveItem,
}: TimelineItemProps): ReactElement {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
  }, []);

  const interactableRef = useInteractableItem(
    item,
    control,
    updateItem,
    dataAtPosition,
    setInteractiveItem
  );

  return (
    <div
      id={item.key}
      key={item.key}
      ref={interactableRef}
      style={{
        gridColumn: "1 / 3",
        gridRow: 1,
        boxSizing: "border-box",
        transform: `translate(${item.left}px, ${item.top}px)`,
        width: item.width,
        height: item.height,
        padding: 3,
        transition: "all 0.3s",
        opacity,
      }}
    >
      <div
        style={{
          background: "red",
          width: "100%",
          height: "100%",

          transition: "opacity 0.5s 0.1s",
          opacity,
        }}
      />
    </div>
  );
}
