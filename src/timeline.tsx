import React, {
  createContext,
  CSSProperties,
  forwardRef,
  ReactElement,
  ReactNode,
  useContext,
  useRef,
} from "react";

import { VariableSizeGrid, VariableSizeGridProps } from "react-window";
import { TimelineControl } from "./interfaces";

type OmittedVariableSizeGridProps = Omit<
  VariableSizeGridProps,
  | "height"
  | "width"
  | "children"
  | "rowCount"
  | "rowHeight"
  | "columnWidth"
  | "columnCount"
>;

export interface TimelineProps extends OmittedVariableSizeGridProps {
  control: TimelineControl;
  children?: ReactNode;
}

const TimelineContext = createContext<{ children: ReactNode }>({
  children: null,
});

export function Timeline({
  control,
  children,
  ...props
}: TimelineProps): ReactElement {
  const childrenRef = useRef(children);
  childrenRef.current = children;

  return (
    <TimelineContext.Provider value={{ children }}>
      <VariableSizeGrid
        {...props}
        {...control}
        innerElementType={innerElementType}
      >
        {noopRenderer}
      </VariableSizeGrid>
    </TimelineContext.Provider>
  );
}

const innerElementType = forwardRef<HTMLDivElement, { style: CSSProperties }>(
  function GridInner() {
    const { children } = useContext(TimelineContext);
    return <React.Fragment key="grid-fragment">{children}</React.Fragment>;
  }
);

const noopRenderer = () => null;

/* const [initialScrollX] = useState(() => */
/*   !initialScrollTime */
/*     ? 0 */
/*     : Math.max( */
/*         0, */
/*         getPositionAtTime( */
/*           initialScrollTime, */
/*           startTime, */
/*           intervalDuration, */
/*           intervalWidth */
/*         ) - sidebarWidth */
/*       ) */
/* ); */

/* const outerElementStyle = useMemo( */
/*   () => ({ */
/*     display: "grid", */
/*     gridTemplateRows: `${timebarHeaderHeight}px ${ */
/*       timebarIntervalHeight * 2 */
/*     }px 1fr`, */
/*     gridTemplateColumns: `${collectionSidebarWidth}px ${groupSidebarWidth}px calc(100% - ${sidebarWidth}px) 1fr`, */
/*     ...style, */
/*   }), */
/*   [ */
/*     timebarHeaderHeight, */
/*     timebarIntervalHeight, */
/*     collectionSidebarWidth, */
/*     groupSidebarWidth, */
/*     sidebarWidth, */
/*     style, */
/*   ] */
/* ); */
