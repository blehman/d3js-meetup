(function() {

  var client = "utc" // utc reynolds usaa
      , svg
      , xAxis
      , yAxis
      , xScale
      , yScale
      , layout = {width:500
        , height: 300
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
        , svgFudge: [1500,2500]
      }
      , client_name
      , minRadius = 3
      , maxRadius = 60
      , full_opacity = 1
      , simiulationRuns = 500
      , radiusExtent
      , radiusScale
      , abuseColorScale = d3.scaleSequential(d3.interpolateRdBu).clamp(true)
      , nodes
      , stoper = function stop(){}
      , t1 = {"stop":stoper}
      , t2 = {"stop":stoper}
      , nonSendingDomains
      , domain_type = {
        0: 'sending'
        , 1: 'non-sending'
        , 2: 'defensively-registered'
      }
      //, url = "https://vizlab.emaildefense.proofpoint.com/customer_progress/get-viz-data?realm_id={realm_id}".replace("{realm_id}",realm_id)
      , url = "http://127.0.0.1:1203/customer_progress/get-viz-data?realm_id={realm_id}".replace("{realm_id}",realm_id)
      //, files = ["/static/data/aggregate_details_1421.csv","/static/data/aggregate_details_10476575173.csv", "/static/data/aggregate_details_24991.csv", "/static/data/aggregate_details_10476561953.csv"]
  layout.yScaleMin = layout.yScaleRange[layout.yScaleRange.length-1]
  layout.yScaleMax = layout.yScaleRange[0]+20
  layout.xAxisLabel = [255,layout.xAxisY+45]
  // build spinner
  run_spinner()

  // get data
  promises = [d3.csv(url)];

  function run_spinner(){
    var width = window.innerWidth,
        height = window.innerHeight;
    var context = d3.select("body").append("canvas")
      .attr("id","spinner")
      .attr("width", width)
      .attr("height", height)
      .node()
      .getContext("2d");

    var arc = d3.arc()
      .context(context);

    var angles = {
      start: 0,
      end: 5 / 8
    };

    context.translate(width / 2, height / 2);

    stretch("start");

    d3.timer(function(t){

      angles.offset = t / 5000;
      draw();

    });

    function draw() {

      context.clearRect(0, 0, width, height);

      arc.innerRadius(175)
        .outerRadius(210);

      d3.range(0, 181).forEach(function(deg){

        context.fillStyle = context.strokeStyle = d3.interpolateRainbow(deg / 180);

        var start = angles.offset + deg / 180,
            end = start + 1 / 180;

        arc.startAngle(start * Math.PI * 2)
          .endAngle(end * Math.PI * 2);

        context.beginPath();
        arc();
        context.fill();
        context.stroke();

      });

      // lazy clip
      context.fillStyle = context.strokeStyle = "#2a2a2a";
      context.beginPath();
      arc.startAngle((angles.offset + angles.end) * Math.PI * 2)
        .endAngle((angles.offset + angles.start + 1) * Math.PI * 2)
        .innerRadius(170)
        .outerRadius(215)();
      context.fill();
      context.stroke();

    }

    function stretch(type) {

      var interpolate = d3.interpolateNumber(angles[type], angles[type] + 9 / 16);

      d3.select("body").transition()
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
  }

  // get data
  Promise.all(promises).then(runApp)
  function runApp(details){
    // remove spinner
    d3.selectAll("#spinner").remove()

    details = details[0].map(function(d){
      client_name = d.account_name;
      return {
        "legitimate_dmarc_fail":+d.legitimate_dmarc_fail
        ,"auth_fail_messages":+d.auth_fail_messages
        ,"legitimate_messages":+d.legitimate_messages
        ,"legitimate_policy_applied":+d.legitimate_policy_applied
        ,"suspicious_messages":+d.suspicious_messages
        ,"total_messages":+d.total_messages
        ,"DMARC_pass_ratio":+d.DMARC_pass_ratio
        ,"double_pass_ratio":+d.double_pass_ratio
        ,"policy": d.policy
        ,"domain":d.domain
        ,"domain_use":d.domain_use
        ,"abuse_ratio": (+d.total_messages>0? (+d.suspicious_messages/+d.total_messages):0)
        , "client_name": d.account_name
      }
    })
    console.log(details)
    nonSendingDomains = details.filter(d => d.legitimate_messages ==0);
    sendingDomains = details.filter(d => d.legitimate_messages>0);
    //
    // div
    //
    const div = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    //
    // svg
    //
    svg = d3.select("#viz-container").append("svg")
      .attr("id","viz-svg")
      .attr("width", layout.width+layout.svgFudge[0])
      .attr("height", layout.height+layout.svgFudge[1])
      //.attr("pointer-events", "none")

    //
    // g
    //
    viz = svg.append("g")
      .attr("id","viz")
      .attr("transform","translate("+layout.vizStartX+","+layout.vizStartY+")")
      //attr("pointer-events", "none")

    //
    // radius
    ///
    radiusExtent = d3.extent(details,d=>d.legitimate_messages)
    radiusScale = d3.scaleLinear()
      .domain([0,radiusExtent[1]])
      .range([minRadius,maxRadius])

    //
    // xAxis
    //
    percentFormat = d3.format(".0%")
    authExtent = d3.extent(details,d=>d.DMARC_pass_ratio)
    xScale = d3.scaleLinear()
      .domain(authExtent)
      .range([0,layout.width]);


    xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => percentFormat(d));

    xAxis2 = d3.axisBottom(d3.scaleLinear().range(layout.nonSendingXScaleRange))
      .ticks(0)
      .tickFormat("");

    viz.append("g")
      .classed("x-axis axis",true)
      .attr("transform", "translate("+layout.xAxisX1+","+layout.xAxisY+")")
      .call(xAxis);
/*
    viz.append("g")
      .classed("x-axis axis",true)
      .attr("transform", "translate("+layout.xAxisX2+","+layout.xAxisY+")")
      .call(xAxis2);

    viz.append("text")
      .classed("axis",true)
      .attr("transform", "translate("+layout.heading2[0]+","+layout.heading2[1]+")")
      .style("text-anchor", "middle")
      .style("font","20px sans-serif")
      .text("Non-Sending Domain Progress");
*/
    viz.append("text")
      .classed("axis",true)
      .attr("transform", "translate("+layout.xAxisLabel[0]+","+layout.xAxisLabel[1]+")")
      .style("text-anchor", "middle")
      //.style("font","20px sans-serif")
      .text("Percentage of Legitimate Email Authenticating");

    viz.append("text")
      .classed("axis",true)
      .attr("transform", "translate("+layout.heading1[0]+","+layout.heading1[1]+")")
      .style("text-anchor", "middle")
      .style("font","20px sans-serif")
      .text("{client_name}: Domain Progress".replace("{client_name}",client_name));
    //
    // yAxis
    //
    yScale = d3.scaleOrdinal()
      .domain(["unknown", "monitor", "quarantine", "reject"])
      .range(layout.yScaleRange);

    yAxis = d3.axisLeft(yScale)
      .tickValues(["no record", "monitor", "quarantine", "reject"]);

    viz.append("g")
      .classed("y-axis axis",true)
      .attr("transform", "translate("+(-layout.axisPadding)+","+layout.yAxisY+")")
      .call(yAxis);
    //
    // Abuse color
    //
    abuseExtent = d3.extent(details,d=>d.abuse_ratio)
    abuseColorScale.domain([abuseExtent[1],abuseExtent[0]])
    //abuseColorScale.domain(abuseExtent)
    //
    // shape scale
    //
    circleShape = d3.symbols[0];
    yShape = d3.symbols[4];
    shapeScale = d3.scaleOrdinal()
          .domain([0, 1])
          .range([yShape,circleShape]);

    //
    // simulation
    //
    var simulation = d3.forceSimulation(details)
    .force("x", d3.forceX(function(d) {
      var start  = 5;
      var xVal = Math.max(start+radiusScale(d.legitimate_messages+1), Math.min(layout.width - radiusScale(d.legitimate_messages+1),  xScale(d.DMARC_pass_ratio)))
      /*
      var xVal = layout.nonSendingXForceStart;
      if (d.legitimate_messages>0) {
          var start  = 5;
          xVal = Math.max(start+radiusScale(d.legitimate_messages+1), Math.min(layout.width - radiusScale(d.legitimate_messages+1),  xScale(d.auth_ratio)))
      }
      */
      return xVal; }).strength(10))
    .force("y", d3.forceY(function(d) {
      //yVal = yScale(d.policy)
      var yVal = Math.max( layout.yScaleMin, Math.min(layout.yScaleMax,yScale(d.policy)))
      return yVal; }).strength(10))
    .force("collide", d3.forceCollide(d => radiusScale(d.legitimate_messages+1)))
    //.on("tick",ticked)
    .stop();
    // run simulation
    for (var i = 0; i < simiulationRuns; ++i) simulation.tick();

    //
    // nodes
    //
    nodes =  viz.selectAll("#domain")
      //.data(sendingDomains)
      .data(details)
      .enter().append("circle")
      //.append("path")
      //.attr("d", d3.symbol()
      //   .size(d => 5000*radiusScale(d.legitimate_messages+1)/radiusScale.range()[1])//return Math.PI*Math.pow(size(d.size)||nominal_base_node_size,2); })
      //   .type(d => shapeScale(d.legitimate_messages>0)))
      //.attr("transform",d=> "translate("+d.x+","+d.y+")")
        .classed("inactive domain_circ",true)
        //.attr("pointer-events", "none")
        .attr("id",d => shorten_string(d.domain))
        .attr("r",d => radiusScale(d.legitimate_messages+1))
        .attr("cx",d => d.x)
        .attr("cy",d => d.y)
        .style("fill",function(d){
          if ((d.legitimate_messages==0)&(d.policy=="unknown")){
            return "none"
          }else{
            return abuseColorScale(d.abuse_ratio)
          }
        })//colorScale(d.policy))
        .style("opacity",d=>full_opacity)
        .on("mouseenter", function(d) {
          d3.event.stopPropagation()
          //var mouseCoords = d3.mouse(this)
          var DMARC_pass_ratio = round_ratio(d.DMARC_pass_ratio,2)
            , double_pass_ratio = round_ratio(d.double_pass_ratio,2)
            , abuse_ratio =  round_ratio(d.abuse_ratio,2)
            , results = "Domain: "+ d.domain + ' \n'
            //+ "Domain-Type: "+ domain_type[d.domain_use] + ' \n'
              + "DMARC Policy: "+ d.policy + '\n'
              + "Authorized Message Volume: "+ (d.legitimate_messages).toLocaleString() + ' \n'
              + "Total Message Volume: "+ (d.total_messages).toLocaleString() + ' \n'
              + "DMARC Pass Authentication Rate: " + DMARC_pass_ratio + '%' + ' \n'
              + "Double Pass Authentication Rate: " + double_pass_ratio + '%' + ' \n'
              + "Domain Abuse Rate: " + abuse_ratio + '%';

          t1.stop();
          t1 = d3.timer(function(elapsed) {
            if (elapsed > 3000) t1.stop();
            buildAnnotations(d, results)
            re_activate_class(shorten_string(d.domain))
            mute_inactive()
          })
        })
        .on("mouseleave", function(d){
          d3.event.stopPropagation()
          t1.stop()
          remove_annotation()
          de_activate_class(shorten_string(d.domain))
          unmute_inactive()
        })



    //
    // y-gridlines
    //
    // add the Y gridlines
    viz.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines(yScale)
            .tickSize(-layout.width)
            .tickFormat("")
        )
/*
      // add the Y2gridlines
      viz.append("g")
          .attr("transform","translate(800,0)")
          .attr("class", "grid")
          .call(make_y_gridlines2(yScale)
              .tickSize(200)
              .tickFormat("")
          )
*/
    //
    // colorScale
    //
    /*
    colorScale = d3.scaleOrdinal()
      .domain(["unknown", "monitor", "quarantine", "reject"])
      .range([d3.rgb(242, 94, 68),d3.rgb(242, 236, 80),d3.rgb(233, 205, 14),d3.rgb(23, 223, 37)])
    */
    create_legend()

    function calc_rounded_extent(extentArray){
      var messageExtent = extentArray
        , maxRound = Math.floor(messageExtent[1])
        , minRound = Math.floor(messageExtent[0])
        , maxDigits = String(maxRound).length
        , minDigits = String(minRound).length
        , maxValue = + ("1"+"0".repeat(maxDigits))
        , minValue = + ("1"+"0".repeat(d3.min(0,minDigits -1)));

      return [minValue, maxValue]

    }
    function abbreviateNumber(value) {
      //Determine the appropriate unit on the label.
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ["", "K", "M", "B","T"];
            var suffixNum = Math.floor( (""+value).length/3 );
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
            newValue = shortValue+suffixes[suffixNum];
        }
        return newValue;
    }

    function create_legend(){
      viz.append("g")
        .attr("class", "abuseLegend")
        .attr("transform", "translate(615,320)");

      var abuseLegendText = viz.select(".abuseLegend")
        .append("text")
        .text("abuse ratio")
        .classed("axis",true)
        .attr("x",-10)
        .attr("y",-10)
        .attr("opacity",0.89)

      var abuseLegend = d3.legendColor()
        .labelFormat(d3.format("0.0%"))
        .shapeWidth(30)
        .cells(10)
        .orient("vertical")
        .scale(abuseColorScale)


      viz.select(".abuseLegend")
        .call(abuseLegend);

      viz.append("g")
        .attr("class", "emailVolumeLegend")
        .attr("transform", "translate(620,130)");

      var emailVolumeLegendText = viz.select(".emailVolumeLegend")
        .append("text")
        .text("legitmate email volume")
        .classed("axis",true)
        .attr("x",-10)
        .attr("y",-10)
        .attr("opacity",0.89)

      var emailVolumeLegend = d3.legendSize()
        .labelFormat(d3.format(","))
        .scale(radiusScale)
        .shape('circle')
        .shapePadding(35)
        .labelOffset(20)
        .orient('Horizontal');

      viz.select(".emailVolumeLegend")
        .call(emailVolumeLegend);
    }
    function remove_annotation(){
      d3.selectAll(".annotation-group")
        .selectAll("*").remove();
    }
    function buildAnnotations(nodeData, results){
      var xCheck = nodeData.x < (layout.width/2)? 1:-1;
      console.log(nodeData.y)
      const annotations = [
        {
          //below in makeAnnotations has type set to d3.annotationLabel
          //you can add this type value below to override that default
          type: d3.annotationCalloutCircle
          , note: {
            label: "{results}".replace("{results}",results)
            , wrapSplitter: /\n/
            ,title: "Domain Details"
            //,wrap:500
          }
          //settings for the subject, in this case the circle radius
          , subject: {
            radius: radiusScale(nodeData.legitimate_messages+1)+5
          }
          , x: nodeData.x+layout.vizStartX
          , y: nodeData.y+layout.vizStartY
          , dx: xCheck * (radiusScale(nodeData.legitimate_messages+1)+15)
          , dy: -1 * (radiusScale(nodeData.legitimate_messages+1)+15)
        }].map(function(d){ d.color = "#fff"; return d})//abuseColorScale(nodeData.abuse_ratio); return d})

      const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations);

      d3.select(".annotation-group")
        .remove()

      d3.select("svg")
        .append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
        /*
        .transition()
        .duration(400)
        .ease(Math.sqrt)
        .style("opacity",0.40)
        .remove()
        */
    }
    function adjacentQuadrant(svgCoords){
      var xZone = (svgCoords[0]<=0)? "neg":"pos"
        , yZone = (svgCoords[1]<=0)? "neg":"pos"
        , coordSign = xZone+"-"+yZone
        , identifyQuadrant = {
          "pos-neg":"I"
          , "neg-neg":"II"
          , "neg-pos":"III"
          , "pos-pos":"IV"
        }
    /* Quadrants:
          "I": 3*Math.PI/12
        , "II": 9*Math.PI/12
        , "III": 15*Math.PI/12
        , "IV": 21*Math.PI/12
    */
        , adjacentRad = {
              "I": 15*Math.PI/12
            , "II": 21*Math.PI/12
            , "III": 3*Math.PI/12
            , "IV": 9*Math.PI/12
          }
        , quadrant = identifyQuadrant[coordSign]
        , rad = adjacentRad[quadrant];
        return [Math.cos(rad),-Math.sin(rad)]

    }

    function adjacentQuadrant2(svgCoords){
      var xZone = (svgCoords[0]<=0)? "neg":"pos"
        , yZone = (svgCoords[1]<=0)? "neg":"pos"
        , coordSign = xZone+"-"+yZone
        , identifyQuadrant = {
          "pos-neg":"I"
          , "neg-neg":"II"
          , "neg-pos":"III"
          , "pos-pos":"IV"
        }
        , adjacentRad = {
              "I": 9*Math.PI/12
            , "II": 3*Math.PI/12
            , "III": 21*Math.PI/12
            , "IV": 15*Math.PI/12
          }
        , quadrant = identifyQuadrant[coordSign]
        , rad = adjacentRad[quadrant];
        return [Math.cos(rad),-Math.sin(rad)]

    }
    // gridlines in y axis function
    function make_y_gridlines(yScale) {
        return d3.axisLeft(yScale)
            .ticks(4)
    }

    function make_y_gridlines2(yScale) {
        return d3.axisLeft(yScale)
            .ticks(0)
    }
    function round_ratio(num,digits){
      var res = num*100
      if (res.toFixed(digits)==100.00){
      }
      return res.toFixed(digits)
    }
    function mute_inactive(){
      d3.selectAll(".inactive")
        .transition()
        //.duration(200)
        .style('opacity',0.20)
    }
    function unmute_inactive(){
      d3.selectAll(".inactive")
        .transition()
        //.duration(200)
        .style('opacity',full_opacity)
    }
    function de_activate_class(id_tag){
      d3.select("#"+id_tag)
          .classed("active", false);

      d3.select("#"+id_tag)
        .classed("inactive", true);

    }
    function re_activate_class(id_tag){
      d3.select("#"+id_tag)
          .classed("inactive", false);

      d3.select("#"+id_tag)
        .classed("active", true);

    }
    function shorten_string(str){
      return str.replace(/[.]/g,"")
    }
    function runRand(){
      return Math.random()
    }
    function ticked(){
      // nodes are bounded by size of the svg
      nodes
        .attr("cx", function(d) {
          // hardcode for now
          var start = 500;
          return d.x = Math.max(start+radiusScale(d.amount)+1, Math.min(start - radiusScale(d.amount)-1, d.x));} )
        .attr("cy", function(d) {
          return d.y = Math.min(height-radiusScale(d.amount)-1, Math.max(heightScale(dataObject.total_lookup[d.cost_label+"-"+d.year]) + radiusScale(d.amount) + 1, d.y));}
        )
    }//ticked()
  }//runApp()
}())
