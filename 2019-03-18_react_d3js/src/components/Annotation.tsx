import React, { useRef } from "react";
import * as d3 from "d3";
import {
  annotation,
  annotationLabel,
  annotationCalloutCircle
} from "d3-svg-annotation";
import { renderLifeCycle } from "../hooks/renderLifecycle";
import { NodeDatum } from "../types/dataTypes";
import { Layout } from "./App";

function round_ratio(num: number, digits: number) {
  var res = num * 100;
  return res.toFixed(digits);
}

const getLabelString = (datum: NodeDatum) => {
  const DMARC_pass_ratio = round_ratio(datum.DMARC_pass_ratio, 2);
  const double_pass_ratio = round_ratio(datum.double_pass_ratio, 2);
  const abuse_ratio = round_ratio(datum.abuse_ratio, 2);
  return (
    "Domain: " +
    datum.domain +
    " \n" +
    "DMARC Policy: " +
    datum.policy +
    "\n" +
    "Authorized Message Volume: " +
    datum.legitimate_messages.toLocaleString() +
    " \n" +
    "Total Message Volume: " +
    datum.total_messages.toLocaleString() +
    " \n" +
    "DMARC Single Pass Authentication Rate: " +
    DMARC_pass_ratio +
    "%" +
    " \n" +
    "DMARC Double Pass Authentication Rate: " +
    double_pass_ratio +
    "%" +
    " \n" +
    "Domain Abuse Rate: " +
    abuse_ratio +
    "%"
  );
};

interface AnnotationProps {
  datum: (NodeDatum & d3.SimulationNodeDatum) | null;
  layout: Layout;
  radiusScale: d3.AxisScale<number>;
}

export default ({ datum, layout, radiusScale }: AnnotationProps) => {
  const gRef = useRef<SVGGElement | null>(null);

  renderLifeCycle({
    updateRender: () => {
      if (gRef.current && datum) {
        const xCheck = (datum.x || 0) < layout.width / 2 ? 1 : -1;

        const scaleValue = radiusScale(datum.legitimate_messages + 1) || 0;

        const annotations = [
          {
            type: annotationCalloutCircle,
            note: {
              label: "{results}".replace("{results}", getLabelString(datum)),
              wrapSplitter: /\n/,
              title: "Domain Details"
            },
            subject: {
              radius: scaleValue + 5
            },
            x: datum.x || 0,
            y: datum.y || 0,
            dx: xCheck * (scaleValue + 15),
            dy: -1 * (scaleValue + 15)
          }
        ].map(function(d: any) {
          d.color = "#fff";
          return d;
        });

        const makeAnnotations = annotation()
          .type(annotationLabel)
          .annotations(annotations) as any;

        d3.select(gRef.current).call(makeAnnotations);
      }
    }
  });

  if (!datum) {
    return null;
  }

  return <g className="annotation-group" ref={gRef} pointerEvents="none" />;
};
