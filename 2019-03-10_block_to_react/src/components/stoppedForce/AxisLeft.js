import React, { Component } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

class AxisLeft extends Component {
    constructor(props) {
        super(props);

        this.axisRef = React.createRef();
    }

    componentDidMount() {
        if (this.axisRef.current) {
            select(this.axisRef.current).call(this.createYAxis());
        }
    }

    componentDidUpdate() {
        if (this.axisRef.current) {
          select(this.axisRef.current).call(this.createYAxis());
        }
    }

    createYAxis() {
        const yScale = scaleOrdinal()
            .domain(["unknown", "monitor", "quarantine", "reject"])
            .range(this.props.layout.yScaleRange);

        return axisLeft(yScale)
            .tickValues(["no record", "monitor", "quarantine", "reject"]);
    }

    render() {
        const { layout } = this.props;
        
        return (
            <g transform={`translate(-${layout.axisPadding}, ${layout.yAxisY})`} ref={this.axisRef} />
        );
    }
}

export default AxisLeft;