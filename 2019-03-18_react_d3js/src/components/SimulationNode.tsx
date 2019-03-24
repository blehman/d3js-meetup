import React, { useRef } from "react";
import * as d3 from "d3";
import { renderLifeCycle } from "../hooks/renderLifecycle";
import { NodeDatum } from "../types/dataTypes";

const full_opacity = 1;

interface SimulationNodeProps {
  abuseColorScale: d3.ScaleSequential<string>;
  datum: NodeDatum & d3.SimulationNodeDatum;
  radiusScale: d3.AxisScale<number>;
  setAnnotationDatum: (datum: NodeDatum | null) => void;
}

export default ({
  datum,
  radiusScale,
  abuseColorScale,
  setAnnotationDatum
}: SimulationNodeProps) => {
  const circleRef = useRef<SVGCircleElement>(null);

  // Not Necessary here for as static simulation, but if attached to a `tick` function, this would allow d3 to dynamically update the attributes of the node
  renderLifeCycle({
    firstRender: () => {
      if (circleRef.current) {
        d3.select(circleRef.current).datum(datum);
      }
    }
  });

  const fill =
    datum.legitimate_messages == 0 && datum.policy == "unknown"
      ? "none"
      : abuseColorScale(datum.abuse_ratio);
  const circleProps = {
    r: radiusScale(datum.legitimate_messages + 1),
    fill,
    cx: datum.x,
    cy: datum.y,
    opacity: full_opacity,
    className: "inactive domain_circ",
    onMouseOver: (evt: React.MouseEvent) => {
      evt.stopPropagation();
      setAnnotationDatum(datum);
    },
    onMouseOut: (evt: React.MouseEvent) => {
      evt.stopPropagation();
      setAnnotationDatum(null);
    }
  };

  return <circle ref={circleRef} {...circleProps} />;
};
