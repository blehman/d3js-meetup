import React, { useState } from "react";
import * as d3 from "d3";
import { NodeDatum } from "../types/dataTypes";
import { mapDetails } from "../data/mapDetails";
import "./App.css";
import ResizeSVG from "./ResizeSVG";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import Legend from "./Legend";
import Simulation from "./Simulation";

const data = require("../data/sample_data.csv");
const yScaleRange = [400, 300, 200, 100];
const xAxisY = 500;
const layout = {
  width: 500,
  height: 300,
  vizStartX: 300,
  vizStartY: 100,
  axisPadding: 50,
  xAxisX1: 0,
  xAxisX2: 600,
  xAxisY,
  xAxisLabel: [255, xAxisY + 45],
  yAxisY: 0,
  nonSendingXScaleRange: [0, 200],
  nonSendingXForceStart: 700,
  yScaleRange,
  yScaleMin: yScaleRange[yScaleRange.length - 1],
  yScaleMax: yScaleRange[0] + 20,
  heading1: [255, 30],
  heading2: [700, 30],
  svgFudge: [1500, 2500]
};

export type Layout = typeof layout;

const minRadius = 3;
const maxRadius = 60;

export default () => {
  const [details, setData] = useState<NodeDatum[] | null>(null);
  const [simulationReady, setSimulationReady] = useState<boolean>(false);

  if (!details) {
    d3.csv(data).then((data: any) => {
      const details = data.map(mapDetails);
      setData(details);
    });
  }

  if (details) {
    const radiusExtent = d3.extent(details, d => d.legitimate_messages);
    const radiusScale = d3
      .scaleLinear()
      .domain([0, radiusExtent[1] as number])
      .range([minRadius, maxRadius]);

    const authExtent: any[] = d3.extent(
      details,
      (d: any) => d.double_pass_ratio
    );

    const xScale = d3
      .scaleLinear()
      .domain(authExtent)
      .range([0, layout.width]);

    const yScale = d3
      .scaleOrdinal<number>()
      .domain(["unknown", "monitor", "quarantine", "reject"])
      .range(layout.yScaleRange);

    const abuseExtent = d3.extent(details, (d: any) => d.abuse_ratio) as [
      string,
      string
    ];
    const abuseColorScale = d3.scaleSequential(d3.interpolateRdBu).clamp(true);
    abuseColorScale.domain([Number(abuseExtent[1]), Number(abuseExtent[0])]);

    const yAxisProps = { layout, scale: yScale };
    const xAxisProps = {
      layout,
      scale: xScale,
      details,
      clientName: details[0].client_name
    };
    const legendProps = { details, abuseColorScale };
    const simulationProps = {
      details,
      layout,
      xScale,
      yScale,
      radiusScale,
      abuseColorScale,
      onSimulationReady: setSimulationReady
    };

    return (
      <div
        style={{
          height: `${layout.height + layout.svgFudge[1]}px`,
          width: `${layout.width + layout.svgFudge[0]}px`
        }}
      >
        <h1
          className="loading"
          style={{ display: simulationReady ? "none" : "null" }}
        >
          LOADING...
        </h1>
        <ResizeSVG
          margin={{
            left: layout.vizStartX,
            top: layout.vizStartY,
            bottom: 0,
            right: 0
          }}
        >
          {() => {
            return (
              <g>
                <Legend {...legendProps} />
                <YAxis {...yAxisProps} />
                <XAxis {...xAxisProps} />
                <Simulation {...simulationProps} />
              </g>
            );
          }}
        </ResizeSVG>
      </div>
    );
  }

  return <h1 className="loading">LOADING...</h1>;
};
