import React, { useState } from "react";
import * as d3 from "d3";
import { NodeDatum } from "../types/dataTypes";
import { Layout } from "./App";
import Annotation from "./Annotation";
import SimulationNode from "./SimulationNode";
import { SimulationNodeDatum } from "d3";

function shorten_string(str: string) {
  return str.replace(/[.]/g, "");
}

const simulationRuns = 500;

interface SimulationProps {
  abuseColorScale: d3.ScaleSequential<string>;
  layout: Layout;
  xScale: d3.AxisScale<number>;
  yScale: d3.AxisScale<string>;
  radiusScale: d3.AxisScale<number>;
  data: (NodeDatum & d3.SimulationNodeDatum)[];
  onSimulationReady: (ready: boolean) => void;
}

const createSimulation = ({
  radiusScale,
  layout,
  xScale,
  yScale
}: SimulationProps) => {
  return d3
    .forceSimulation<NodeDatum & d3.SimulationNodeDatum>()
    .force(
      "x",
      d3
        .forceX<d3.SimulationNodeDatum & NodeDatum>(d => {
          const start = 5;
          return Math.max(
            start + (radiusScale(d.legitimate_messages + 1) || 0),
            Math.min(
              layout.width - (radiusScale(d.legitimate_messages + 1) || 0),
              xScale(d.double_pass_ratio) || 0
            )
          );
        })
        .strength(10)
    )
    .force(
      "y",
      d3
        .forceY<d3.SimulationNodeDatum & NodeDatum>(d =>
          Math.max(
            layout.yScaleMin,
            Math.min(layout.yScaleMax, yScale(d.policy) || 0)
          )
        )
        .strength(10)
    )
    .force(
      "collide",
      d3.forceCollide<d3.SimulationNodeDatum & NodeDatum>(
        d => radiusScale(d.legitimate_messages + 1) || 0
      )
    )
    .stop();
};

export default (props: SimulationProps) => {
  const {
    data,
    radiusScale,
    abuseColorScale,
    layout,
    onSimulationReady
  } = props;
  const [simulation, setSimulation] = useState<any>(null);
  const [annotationDatum, setAnnotationDatum] = useState<
    NodeDatum & SimulationNodeDatum | null
  >(null);

  if (!simulation) {
    const simulation = createSimulation(props);
    simulation.nodes(data);
    for (let i = 0; i < simulationRuns; ++i) simulation.tick();
    setSimulation(simulation);
    onSimulationReady(true);
  }

  const annotationProps = {
    datum: annotationDatum,
    layout,
    radiusScale
  };

  return (
    <g>
      {data.map(d => {
        const simulationNodeProps = {
          datum: d,
          radiusScale: radiusScale,
          abuseColorScale: abuseColorScale,
          setAnnotationDatum
        };

        return (
          <SimulationNode
            key={shorten_string(d.domain)}
            {...simulationNodeProps}
          />
        );
      })}
      {<Annotation {...annotationProps} />}
    </g>
  );
};
