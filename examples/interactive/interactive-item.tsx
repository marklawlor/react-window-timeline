import React, { useCallback, useContext, useRef } from 'react';

import '@interactjs/auto-start';
import '@interactjs/auto-scroll';
import '@interactjs/actions/drag';
import '@interactjs/actions/resize';
import '@interactjs/modifiers';
import interact from '@interactjs/interact';

import { Interactable, Rect } from '@interactjs/types';

import { ItemRenderer, TimelineContext, UpdateItemAction } from '../../src';
import InteractionContext, { Interaction } from './interaction-context';

function getLocale() {
  return navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
}

const InteractiveItem: ItemRenderer = ({ item, style }) => {
  const {
    itemData,
    upsertItem,
    getValuesToUpdate,
    sidebarWidth,
    timebarHeight,
    outerRef,
    setStickyItemIds,
  } = useContext(TimelineContext);

  const interactableRef = useRef<Interactable | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const { setInteraction } = useContext(InteractionContext);

  const { groups } = itemData;

  // Create the interactions
  const setRef = useCallback(
    (node: HTMLDivElement) => {
      nodeRef.current = node;

      if (interactableRef.current) {
        // Cleanup any references added to the last instance
        interactableRef.current.unset();
        interactableRef.current = null;
      }

      if (node) {
        const interactable: Interactable = interact(node);

        const outerElement = outerRef.current!;
        let dragPosition = { x: 0, y: 0 };
        let scrollPosition = { left: 0, top: 0 };
        let resizeOffset = { x: 0, y: 0 };

        interactable
          .draggable({
            autoScroll: {
              container: outerRef.current!,
              margin: 50,
              distance: 10,
              interval: 10,
              speed: 500,
            },
            listeners: {
              start() {
                setStickyItemIds([item.id]);

                scrollPosition = {
                  left: outerElement.scrollLeft,
                  top: outerElement.scrollTop,
                };
              },
              move(event) {
                dragPosition.x += event.dx;
                dragPosition.y += event.dy;

                const translateX =
                  dragPosition.x +
                  (outerElement.scrollLeft - scrollPosition.left);

                const translateY =
                  dragPosition.y +
                  (outerElement.scrollTop - scrollPosition.top);

                node.style.transition = '';
                node.style.transform = `translate(${translateX}px, ${translateY}px)`;

                const updatedValues = getValuesToUpdate(
                  event,
                  UpdateItemAction.MOVE
                ) as Interaction;

                setInteraction(updatedValues);
              },
              end(event) {
                upsertItem({
                  ...item,
                  ...getValuesToUpdate(event, UpdateItemAction.MOVE),
                });

                node.style.top = event.clientY;
                node.style.left = event.clientX;

                // Reset
                node.style.transform = '';
                dragPosition = { x: 0, y: 0 };
                setInteraction(null);
                setStickyItemIds([]);
              },
            },
            modifiers: [
              interact.modifiers.restrict({
                restriction: 'parent',
                elementRect: { left: 0, right: 1, top: 0, bottom: 1 },
                offset: {
                  left: sidebarWidth,
                  top: timebarHeight,
                } as Rect,
              }),
            ],
          })
          .resizable({
            autoScroll: {
              container: outerRef.current!,
              margin: 50,
              distance: 10,
              interval: 10,
              speed: 500,
            },
            edges: { top: false, right: true, bottom: false, left: true },
            invert: 'reposition',
            listeners: {
              start() {
                setStickyItemIds([item.id]);

                scrollPosition = {
                  left: outerElement.scrollLeft,
                  top: outerElement.scrollTop,
                };
              },
              move: function(event) {
                const { width, height } = event.rect;

                resizeOffset.x += event.deltaRect.left;
                resizeOffset.y += event.deltaRect.top;

                Object.assign(event.target.style, {
                  width: `${width}px`,
                  height: `${height}px`,
                  transition: '',
                  transform: `translate(${resizeOffset.x}px, ${resizeOffset.y}px)`,
                });
              },
              end(event) {
                upsertItem({
                  ...item,
                  ...getValuesToUpdate(event, UpdateItemAction.RESIZE),
                });

                // Reset
                node.style.transform = '';
                resizeOffset = { x: 0, y: 0 };
              },
            },
            modifiers: [
              interact.modifiers.restrict({
                restriction: 'parent',
                offset: {
                  left: sidebarWidth,
                } as Rect,
              }),
            ],
          });

        interactableRef.current = interactable;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item]
  );

  return (
    <div
      key={item.id}
      ref={setRef}
      style={{
        ...style,
        backgroundColor: groups[item.groupId].color,
        transition: 'all 0.5s',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      Item {item.id}{' '}
      {new Date(item.start).toLocaleString(getLocale(), {
        // dateStyle: 'short',
        timeStyle: 'long',
      } as Intl.DateTimeFormatOptions)}
    </div>
  );
};

export default InteractiveItem;
