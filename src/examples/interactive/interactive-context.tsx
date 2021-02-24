import React, {
  createContext,
  PropsWithChildren,
  useRef,
  useState,
} from 'react';
import { debounce } from 'lodash';

export interface Interaction {
  start: number;
  end: number;
  groupId: string;
}

export interface InteractiveContextValue {
  interaction: Interaction | null;
  setInteraction: (interaction: Interaction | null) => void;
}

const InteractiveContext = createContext<InteractiveContextValue>({
  interaction: null,
  setInteraction: () => undefined,
});

export function InteractiveContextProvider(props: PropsWithChildren<{}>) {
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const handleInteraction = useRef<typeof setInteraction>(
    debounce(setInteraction, 0, { leading: true })
  );

  return (
    <InteractiveContext.Provider
      value={{ interaction, setInteraction: handleInteraction.current }}
      {...props}
    />
  );
}

export default InteractiveContext;
