import React, { Component } from 'react';
import { arc } from 'd3-shape';
import { timer } from 'd3-timer';
import { range } from 'd3-array';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { interpolateNumber } from 'd3-interpolate';

class Spinner extends Component {
    constructor(props) {
        super(props);

        // create the canvas ref
        // read about refs: https://reactjs.org/docs/refs-and-the-dom.html
        this.canvasRef = React.createRef();

        this.runSpinner = this.runSpinner.bind(this);
    }

    runSpinner() {
        // use the ref created on the returned canvas element in the render method
        const canvas = this.canvasRef.current;
        const context = canvas.getContext('2d');
    
        // begin copy and pasted code from bl.ock
        const spinnerArc = arc()
          .context(context);
    
        const angles = {
          start: 0,
          end: 5 / 8
        };
    
        context.translate(canvas.width / 2, canvas.height / 2);
        stretch("start");
    
        timer(function(t){
          angles.offset = t / 5000;
          draw();
        });
    
        function draw() {
          context.clearRect(0, 0, canvas.width, canvas.height);
    
          spinnerArc.innerRadius(175)
            .outerRadius(210);
    
          range(0, 181).forEach(function(deg){
    
            context.fillStyle = context.strokeStyle = interpolateRainbow(deg / 180);
    
            const start = angles.offset + deg / 180,
                end = start + 1 / 180;
    
            spinnerArc.startAngle(start * Math.PI * 2)
              .endAngle(end * Math.PI * 2);
    
            context.beginPath();
            spinnerArc();
            context.fill();
            context.stroke();
          });
    
          // lazy clip
          context.fillStyle = context.strokeStyle = "#2a2a2a";
          context.beginPath();
          spinnerArc.startAngle((angles.offset + angles.end) * Math.PI * 2)
            .endAngle((angles.offset + angles.start + 1) * Math.PI * 2)
            .innerRadius(170)
            .outerRadius(215)();
          context.fill();
          context.stroke();
        }
    
        function stretch(type) {
          const interpolate = interpolateNumber(angles[type], angles[type] + 9 / 16);
    
          select("body").transition()
            .delay(500)
            .duration(1000)
            .tween("angle", function(){
              return function(t){
                angles[type] = interpolate(t);
              };
            })
            .on("end", function(){
              stretch(type === "start" ? "end" : "start");
            });
        }
        // end copy pasted code from bl.ock
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        return (
            <div>
                <button onClick={ this.runSpinner }>Submit</button>
                {/* Add a ref to the canvas element to reference it in this React component */}
                <canvas width={width} height={height} id="spinner" ref={this.canvasRef} />
            </div>
        );
    }
}

export default Spinner;
