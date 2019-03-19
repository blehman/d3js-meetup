import React, { useRef } from "react";
import { renderLifeCycle } from "./hooks/renderLifecycle";
import * as d3 from "d3";
import { Layout, NodeDatum } from "./App";

interface SimulationProps {
  abuseColorScale: d3.ScaleSequential<string>;
  layout: Layout;
  xScale: d3.AxisScale<number>;
  yScale: d3.AxisScale<string>;
  radiusScale: d3.AxisScale<number>;
  details: (NodeDatum & d3.SimulationNodeDatum)[];
}

function shorten_string(str: string) {
  return str.replace(/[.]/g, "");
}

const full_opacity = 1;
const simiulationRuns = 500;

interface SimulationNodeProps {
  abuseColorScale: d3.ScaleSequential<string>;
  datum: NodeDatum & d3.SimulationNodeDatum;
  radiusScale: d3.AxisScale<number>;
}

const SimulationNode = ({
  datum,
  radiusScale,
  abuseColorScale
}: SimulationNodeProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
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
    className: "inactive domain_circ"
  };
  return <circle ref={circleRef} {...circleProps} />;
};

export default ({
  abuseColorScale,
  layout,
  xScale,
  yScale,
  radiusScale,
  details
}: SimulationProps) => {
  var simulation = d3
    .forceSimulation<NodeDatum & d3.SimulationNodeDatum>()
    .force(
      "x",
      d3
        .forceX<d3.SimulationNodeDatum & NodeDatum>(function(d) {
          var start = 5;
          var xVal = Math.max(
            start + (radiusScale(d.legitimate_messages + 1) || 0),
            Math.min(
              layout.width - (radiusScale(d.legitimate_messages + 1) || 0),
              xScale(d.double_pass_ratio) || 0
            )
          );
          /*
    var xVal = layout.nonSendingXForceStart;
    if (d.legitimate_messages>0) {
        var start  = 5;
        xVal = Math.max(start+radiusScale(d.legitimate_messages+1), Math.min(layout.width - radiusScale(d.legitimate_messages+1),  xScale(d.auth_ratio)))
    }
    */
          return xVal;
        })
        .strength(10)
    )
    .force(
      "y",
      d3
        .forceY<d3.SimulationNodeDatum & NodeDatum>(function(d) {
          //yVal = yScale(d.policy)
          var yVal = Math.max(
            layout.yScaleMin,
            Math.min(layout.yScaleMax, yScale(d.policy) || 0)
          );
          return yVal;
        })
        .strength(10)
    )
    .force(
      "collide",
      d3.forceCollide<d3.SimulationNodeDatum & NodeDatum>(
        d => radiusScale(d.legitimate_messages + 1) || 0
      )
    )
    //.on("tick",ticked)
    .stop();

  simulation.nodes(details);

  for (var i = 0; i < simiulationRuns; ++i) simulation.tick();

  return (
    <g>
      {details.map((d, i) => {
        return (
          <SimulationNode
            key={shorten_string(d.domain)}
            datum={d}
            radiusScale={radiusScale}
            abuseColorScale={abuseColorScale}
          />
        );
      })}
    </g>
  );
  // nodes = viz
  //   .selectAll("#domain")
  //   //.data(sendingDomains)
  //   .data(details)
  //   .enter()
  //   .append("circle")
  //   //.append("path")
  //   //.attr("d", d3.symbol()
  //   //   .size(d => 5000*radiusScale(d.legitimate_messages+1)/radiusScale.range()[1])//return Math.PI*Math.pow(size(d.size)||nominal_base_node_size,2); })
  //   //   .type(d => shapeScale(d.legitimate_messages>0)))
  //   //.attr("transform",d=> "translate("+d.x+","+d.y+")")
  //   .classed("inactive domain_circ", true)
  //   //.attr("pointer-events", "none")
  //   .attr("id", d => shorten_string(d.domain))
  //   .attr("r", d => radiusScale(d.legitimate_messages + 1))
  //   .attr("cx", d => d.x)
  //   .attr("cy", d => d.y)
  //   .style("fill", function(d) {
  //     if ((d.legitimate_messages == 0) & (d.policy == "unknown")) {
  //       return "none";
  //     } else {
  //       return abuseColorScale(d.abuse_ratio);
  //     }
  //   }) //colorScale(d.policy))
  //   .style("opacity", d => full_opacity);
};
