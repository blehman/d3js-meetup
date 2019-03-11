import React, { Component } from 'react';
import { csv } from 'd3-fetch';

import './App.css';
import Spinner from './components/spinner/Spinner';
import AxisLeft from './components/stoppedForce/AxisLeft';
import AxisBottom from './components/stoppedForce/AxisBottom';
import data from './data/sample_data.csv';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      layout: {
        width: 1000
        , height: 800
        , vizStartX: 300
        , vizStartY: 100
        , axisPadding:50
        , xAxisX1: 0
        , xAxisX2: 600
        , xAxisY: 500
        , yAxisY: 0
        , nonSendingXScaleRange: [0,200]
        , nonSendingXForceStart: 700
        , yScaleRange: [400,300,200,100]
        , heading1: [255,30]
        , heading2: [700,30]
      }
    };
  }

  componentDidMount() {
    csv(data).then(res => {
      this.setState({
        data: res
      });
    });
  }

  render() {
    const { data, layout } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <p>
            The d3js Meetup's bl.ock to React Project
          </p>
          { data ? (
            <svg width={layout.width} height={layout.height}>
              <g transform={`translate(${layout.vizStartX}, ${layout.vizStartY})`}>
                <AxisLeft data={data} layout={layout}/>
              </g>
            </svg>
          ) : <Spinner />
          }
        </header>
      </div>
    );
  }
}

export default App;
