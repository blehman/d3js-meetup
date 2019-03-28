import React, { useRef } from "react";
import * as d3 from "d3";
import { legendColor, legendSize } from "d3-svg-legend";
import { renderLifeCycle } from "../hooks/renderLifecycle";

const minRadius = 3;
const maxRadius = 60;

interface AbuseProps {
  details: any;
  abuseColorScale: d3.ScaleSequential<string>;
}

export default ({ details, abuseColorScale }: AbuseProps) => {
  const gRef = useRef<SVGGElement>(null);

  const abuseLegend = legendColor()
    .labelFormat(d3.format("0.0%"))
    .shapeWidth(30)
    .cells(10)
    .orient("vertical")
    .scale(abuseColorScale);

  const radiusExtent: any = d3.extent(
    details,
    (d: any) => d.legitimate_messages
  );
  const radiusScale = d3
    .scaleLinear()
    .domain([0, radiusExtent[1]])
    .range([minRadius, maxRadius]);

  const emailVolumeLegend = legendSize()
    .labelFormat(d3.format(".2s"))
    // .labelFormat(d3.format(","))
    .shape("circle")
    .shapePadding(35)
    .labelOffset(20)
    .orient("horizontal")
    .scale(radiusScale);

  renderLifeCycle({
    firstRender: () => {
      if (gRef.current) {
        d3.select(gRef.current)
          .select(".abuseLegend")
          .call(abuseLegend as any);

        d3.select(gRef.current)
          .select(".emailVolumeLegend")
          .call(emailVolumeLegend as any);
      }
    }
  });

  const textAttrs = {
    x: -10,
    y: -10,
    opacity: 0.89
  };

  return (
    <g ref={gRef}>
      <g className="abuseLegend" transform="translate(615,320)">
        <text className="axis" {...textAttrs}>
          ratio
        </text>
      </g>
      <g className="emailVolumeLegend" transform="translate(620,130)">
        <text className="axis" {...textAttrs}>
          volume
        </text>
      </g>
    </g>
  );
};
