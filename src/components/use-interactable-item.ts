import { useCallback, useRef } from "react";
import { parse, stringify } from "transform-parser";

import "@interactjs/auto-start";
import "@interactjs/auto-scroll";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";

import { Interactable, InteractEvent } from "@interactjs/types";
import {
  DataAtPosition,
  Item,
  TimelineControl,
  TimelineItem,
} from "../interfaces";

export default function useInteractableItem(
  item: TimelineItem,
  control: TimelineControl,
  updateItem: (item: Item) => void,
  dataAtPosition: DataAtPosition,
  setInteractiveItem: (item: Item | undefined) => void
): (node: HTMLDivElement) => void {
  const interactableRef = useRef<Interactable | null>(null);

  const itemRef = useRef(item.item);
  itemRef.current = item.item;

  const updateItemRef = useRef(updateItem);
  updateItemRef.current = updateItem;
  const dataAtPositionRef = useRef(dataAtPosition);
  dataAtPositionRef.current = dataAtPosition;

  // Create the interactions
  const setRef = useCallback(
    (node: HTMLDivElement) => {
      if (node && interactableRef.current?.target !== node) {
        interactableRef.current?.unset();

        interactableRef.current = interact(node);

        const container = control.outerRef.current!;

        let zIndex: string | number = "";
        let translate: Array<number> = [];
        let transition: string = "";

        let isAutoScrolling = false;
        let autoScrollDeltas: Array<{ x: number; y: number }> = [];

        const cancelAutoScroll = debounce(() => {
          isAutoScrolling = false;
        }, 50);

        interactableRef.current
          .draggable({
            autoScroll: {
              container,
            },
            listeners: {
              ["interactions:before-action-move"](event) {
                console.log(event);
              },
              start() {
                zIndex = node.style.zIndex;
                transition = node.style.transition;
                translate = parse(node.style.transform).translate as number[];

                Object.assign(node.style, {
                  zIndex: 10,
                  transition: "",
                });
              },
              move(event) {
                if (isAutoScrolling) {
                  const deltas = [...autoScrollDeltas];
                  autoScrollDeltas = [];

                  for (const delta of deltas) {
                    translate[0] += delta.x;
                    translate[1] += delta.y;
                  }
                } else {
                  translate[0] += event.delta.x;
                  translate[1] += event.delta.y;
                }

                const { suggestedItem } = dataAtPositionRef.current(
                  {
                    x: translate[0],
                    y: translate[1] + event.rect.height / 2,
                  },
                  {
                    width: event.rect.width,
                    scrollLeft: 0,
                  }
                );

                setInteractiveItem({
                  ...itemRef.current,
                  ...suggestedItem,
                });

                node.style.transform = stringify({ translate });
              },
              end(event) {
                Object.assign(node.style, {
                  zIndex,
                  transition,
                });

                setInteractiveItem(undefined);

                const { suggestedItem } = dataAtPositionRef.current(
                  {
                    x: translate[0],
                    y: translate[1] + event.rect.height / 2,
                  },
                  {
                    width: event.rect.width,
                    scrollLeft: 0,
                  }
                );

                if (suggestedItem) {
                  updateItemRef.current({
                    ...itemRef.current,
                    ...suggestedItem,
                  });
                }
              },
            },
            modifiers: [
              interact.modifiers.restrict({
                restriction: "parent",
                elementRect: { left: 1, right: 1, top: 1, bottom: 1 },
              }),
            ],
          })
          .resizable({
            autoScroll: {
              container: container,
              margin: 50,
              distance: 10,
              interval: 10,
              speed: 500,
            },
            edges: { top: false, right: true, bottom: false, left: true },
            invert: "reposition",
            listeners: {
              start() {
                zIndex = node.style.zIndex;
                transition = node.style.transition;

                translate = parse(node.style.transform).translate as number[];

                Object.assign(node.style, {
                  zIndex: 10,
                  transition: "",
                });
              },
              move(event) {
                const { width } = event.rect;

                translate[0] += event.deltaRect.left;

                const { suggestedItem } = dataAtPositionRef.current(
                  {
                    x: translate[0],
                    y: translate[1] + event.rect.height / 2,
                  },
                  {
                    width,
                    scrollLeft: 0,
                  }
                );

                setInteractiveItem({
                  ...itemRef.current,
                  ...suggestedItem,
                });

                Object.assign(event.target.style, {
                  width: `${width}px`,
                  transform: stringify({ translate }),
                });
              },
              end(event: InteractEvent) {
                Object.assign(node.style, {
                  zIndex,
                  transition,
                });

                const { suggestedItem } = dataAtPositionRef.current(
                  {
                    x: translate[0],
                    y: event.rect.top,
                  },
                  {
                    scrollLeft: 0,
                    width: event.rect.width,
                  }
                );

                updateItemRef.current({
                  ...itemRef.current,
                  ...suggestedItem,
                });

                setInteractiveItem(undefined);
              },
            },
          })
          .on("autoscroll", function (event) {
            if (event.interaction.currentAction() === "drag") {
              isAutoScrolling = true;
              autoScrollDeltas.push(event.delta);
            } else {
              event.interaction.coords.cur.page.x += event.delta.x;
              event.interaction.coords.cur.page.y += event.delta.y;
              event.interaction.coords.delta.page.x = event.delta.x;
              event.interaction.coords.delta.page.y = event.delta.y;
            }

            event.interaction.move({ event });

            cancelAutoScroll();
          });
      }
    },
    [control, item]
  );

  return setRef;
}

function debounce<T extends Function>(cb: T, wait: number) {
  let h = 0;
  let callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait) as any;
  };
  return <T>(<any>callable);
}
