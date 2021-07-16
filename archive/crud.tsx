import React, { createContext, ReactNode, useRef, useState } from "react";
import { debounce } from "lodash";

export interface Interaction {
  start: number;
  end: number;
  groupId: string;
}

export interface InteractionContextValue {
  interaction: Interaction | null;
  setInteraction: (interaction: Interaction | null) => void;
}

const InteractionContext = createContext<InteractionContextValue>({
  interaction: null,
  setInteraction: () => undefined,
});

export function CrudContextProvider(props: { children?: ReactNode }) {
  const handleInteraction = useRef<typeof setInteraction>(
    debounce(setInteraction, 0, { leading: true })
  );

  return (
    <InteractionContext.Provider
      value={{ interaction, setInteraction: handleInteraction.current }}
      {...props}
    />
  );
}

export default InteractionContext;
