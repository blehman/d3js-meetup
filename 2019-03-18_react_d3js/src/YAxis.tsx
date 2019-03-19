import React, { useRef } from "react";
import * as d3 from "d3";
import { renderLifeCycle } from "./hooks/renderLifecycle";
import { Layout } from "./App";

interface XAxisProps {
  layout: Layout;
  scale: d3.AxisScale<string>;
}

export default ({ layout, scale }: XAxisProps) => {
  const gRef = useRef<SVGGElement>(null);

  const yAxis = d3
    .axisLeft(scale)
    .tickValues(["no record", "monitor", "quarantine", "reject"]);

  const gridLines = d3
    .axisLeft(scale)
    .ticks(4)
    .tickSize(-layout.width)
    .tickFormat("" as any);

  renderLifeCycle({
    firstRender: () => {
      if (gRef.current) {
        d3.select(gRef.current)
          .select(".y-axis")
          .call(yAxis as any);

        d3.select(gRef.current)
          .select(".grid")
          .call(gridLines as any);
      }
    }
  });

  return (
    <g ref={gRef}>
      <g className="grid" />
      <g
        transform={
          "translate(" + -layout.axisPadding + "," + layout.yAxisY + ")"
        }
        className="y-axis axis"
      />
    </g>
  );
};
