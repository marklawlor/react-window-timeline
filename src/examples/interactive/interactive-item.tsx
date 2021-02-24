import React, { useCallback, useContext, useRef } from 'react';

import '@interactjs/auto-start';
import '@interactjs/auto-scroll';
import '@interactjs/actions/drag';
import '@interactjs/actions/resize';
import '@interactjs/modifiers';
import interact from '@interactjs/interact';

import { Interactable, Rect } from '@interactjs/types';

import { ItemRenderer, TimelineContext, UpdateItemAction } from '../../../src';
import InteractiveContext, { Interaction } from './interactive-context';

function getLocale() {
  return navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
}

const InteractiveItem: ItemRenderer = ({ item, style }) => {
  const {
    itemData,
    updateItem,
    getValuesToUpdate,
    sidebarWidth,
    timebarHeight,
  } = useContext(TimelineContext);

  const interactableRef = useRef<Interactable | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const { setInteraction } = useContext(InteractiveContext);

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

        let dragPosition = { x: 0, y: 0 };
        let resizeOffset = { x: 0, y: 0 };

        interactable
          .draggable({
            listeners: {
              move(event) {
                dragPosition.x += event.dx;
                dragPosition.y += event.dy;

                node.style.transition = '';
                node.style.transform = `translate(${dragPosition.x}px, ${dragPosition.y}px)`;

                const updatedValues = getValuesToUpdate(
                  event,
                  UpdateItemAction.MOVE
                ) as Interaction;

                setInteraction(updatedValues);
              },
              end(event) {
                updateItem({
                  ...item,
                  ...getValuesToUpdate(event, UpdateItemAction.MOVE),
                });

                node.style.top = event.clientY;
                node.style.left = event.clientX;

                // Reset
                node.style.transform = '';
                dragPosition = { x: 0, y: 0 };
                setInteraction(null);
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
            edges: { top: false, right: true, bottom: false, left: true },
            invert: 'reposition',
            listeners: {
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
                updateItem({
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
