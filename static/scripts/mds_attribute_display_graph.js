$.getScript("/static/scripts/helper_methods.js", function() {

  //Scatterplot
  var svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 100, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // add the graph canvas to the body of the webpage
  svg = svg.attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  /* 
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - sets up axis
   */ 
function renderScatterplot() {
  // setup fill color
  // var cValue = function(d) { return d.Manufacturer;},
  //     color = d3.scaleOrdinal(d3.schemeCategory10);

  
    // load data
    d3.csv("/static/mds_attributes_display_xy_pairs.csv", function(data){

      var tweets = data

      console.log(data)

      tweets.forEach(function(data_point) {
        data_point['x'] = +data_point['x']
        data_point['y'] = +data_point['y']
      });

      // setup x
      var xValue = function(d) { return d['x'] } // data -> value
      var xScale = d3.scaleLinear().range([0, width])
      xScale.domain([d3.min(tweets, xValue), d3.max(tweets, xValue)]).nice();

      var xMap = function(d) { return xScale(xValue(d));} // data -> display
      var xAxis = d3.axisBottom().scale(xScale);

      // setup y
      var yValue = function(d) { return d['y'] } // data -> value
      var yScale = d3.scaleLinear().range([height, 0]) // value -> display
      yScale.domain([d3.min(tweets, yValue), d3.max(tweets, yValue)]).nice();
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.axisLeft().scale(yScale);

      // x-axis
      xAxisEl = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
      xAxisEl.append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Calories");

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Protein (g)");

      // draw dots
      svg.selectAll(".dot")
          .data(tweets)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .attr("r", 5)
          // .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("<b>" + d[""] + "</b><br><br/><b>(" + xValue(d) + ", " + yValue(d) + ")</b><br/>")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });
    });
  }

  renderScatterplot()
});