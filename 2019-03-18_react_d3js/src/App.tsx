import React, { useState } from "react";
import * as d3 from "d3";
import ResizeSVG from "./ResizeSVG";
import "./App.css";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import Legend from "./Legend";
const data = require("./data/sample_data.csv");
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

export interface NodeDatum {
  legitimate_dmarc_fail: number;
  auth_fail_messages: number;
  legitimate_messages: number;
  legitimate_policy_applied: number;
  suspicious_messages: number;
  total_messages: number;
  DMARC_pass_ratio: number;
  double_pass_ratio: number;
  policy: string;
  domain: string;
  domain_use: string;
  abuse_ratio: number;
  client_name: string;
}
export type Layout = typeof layout;

const minRadius = 3;
const maxRadius = 60;
const full_opacity = 1;
const simiulationRuns = 500;

export default () => {
  const [details, setData] = useState<NodeDatum[] | null>(null);

  if (!details) {
    d3.csv(data).then((data: any) => {
      const details = data.map((d: any) => {
        // client_name = d.account_name;
        return {
          legitimate_dmarc_fail: +d.legitimate_dmarc_fail,
          auth_fail_messages: +d.auth_fail_messages,
          legitimate_messages: +d.legitimate_messages,
          legitimate_policy_applied: +d.legitimate_policy_applied,
          suspicious_messages: +d.suspicious_messages,
          total_messages: +d.total_messages,
          DMARC_pass_ratio: +d.DMARC_pass_ratio,
          double_pass_ratio: +d.double_pass_ratio,
          policy: d.policy,
          domain: d.domain,
          domain_use: d.domain_use,
          abuse_ratio:
            +d.total_messages > 0
              ? +d.suspicious_messages / +d.total_messages
              : 0,
          client_name: d.account_name
        };
      });
      setData(details);
    });
  }

  if (details) {
    const nonSendingDomains = details.filter(d => d.legitimate_messages == 0);
    const sendingDomains = details.filter(d => d.legitimate_messages > 0);
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

    const yAxisProps = { layout, scale: yScale };
    const xAxisProps = {
      layout,
      scale: xScale,
      details,
      clientName: details[0].client_name
    };
    const legendProps = { details };

    return (
      <div
        style={{
          height: `${layout.height + layout.svgFudge[1]}px`,
          width: `${layout.width + layout.svgFudge[0]}px`
        }}
      >
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
              </g>
            );
          }}
        </ResizeSVG>
      </div>
    );
  }

  return <h1>LOADING...</h1>;
};
