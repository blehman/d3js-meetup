import React, { useRef } from "react";
import * as d3 from "d3";
import { renderLifeCycle } from "../hooks/renderLifecycle";
import { Layout } from "./App";

interface XAxisProps {
  details: any;
  layout: Layout;
  clientName: string;
  scale: d3.AxisScale<any>;
}

export default ({ details, layout, clientName, scale }: XAxisProps) => {
  const gRef = useRef<SVGGElement>(null);
  const percentFormat = d3.format(".0%");

  const xAxis = d3
    .axisBottom(scale)
    .ticks(5)
    .tickFormat(d => percentFormat(d));

  renderLifeCycle({
    firstRender: () => {
      if (gRef.current) {
        d3.select(gRef.current)
          .attr(
            "transform",
            "translate(" + layout.xAxisX1 + "," + layout.xAxisY + ")"
          )
          .call(xAxis);
      }
    }
  });

  return (
    <g>
      <g ref={gRef} className="x-axis axis" />
      <text
        transform={
          "translate(" + layout.xAxisLabel[0] + "," + layout.xAxisLabel[1] + ")"
        }
        textAnchor="middle"
        className="axis"
      >
        Percentage of Legitimate Email Authenticating
      </text>
      <text
        style={{ font: "20px sans-serif" }}
        transform={
          "translate(" + layout.heading1[0] + "," + layout.heading1[1] + ")"
        }
        textAnchor="middle"
        className="axis"
      >
        {clientName}: Domain Progress
      </text>
    </g>
  );
};
