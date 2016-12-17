$.getScript("/static/scripts/helper_methods.js", function(){
  //These attributes could be derived from the data
  axisLabels = ["is_retweet","u_followers","u_friends","u_statuses","u_favorites"];
  attributes = ["es_is_retweet_status","user.followers_count","user.friends_count","user.statuses_count","user.favourites_count"];
  // attributes = ["carat","depth","table","price","x","y","z"];
  attributeMatrix = [];

  attributes.forEach(function (a, x) {
    attributes.forEach(function (b, y) {
      //create an n-by-n matrix based on pairs of attributes
      attributeMatrix.push({a: a, b: b, x: x, y: y})
    })
  })

  colors = d3.scaleOrdinal().range(["#827abf", "#f62150", "#6f89b6", "#f5e0b7", "#5b1e37", "#b9e3c5"]);

  $.getJSON("/static/500_tweets_sample_trump_formatted_augmented.json", scatterplot_matrix);
  // d3.csv("https://gist.githubusercontent.com/emeeks/6decab485fd2e02c9f1e/raw/9e4d0d1c427d565aa7e3099120f0eca342d035a2/diamonds.csv", scatterplot_matrix);

  var svg = d3.select("svg"),
      margin = {top: 80, right: 20, bottom: 100, left: 80},
      width = 700 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

  // add the graph canvas to the body of the webpage
  svg = svg.attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function scatterplot_matrix(data) {

    data = data.tweets
    // console.log(data)

    //d3.csv pulls in data as strings so they need to be formatted as numbers
    data.forEach(function (d) {
      attributes.forEach(function (att) {
        if (att === "es_is_retweet_status") {
          d[att] = d[att] === true ? 1 : 0
        }
      })
    })

    //create scales dynamically for each attribute's extent

    scale = {};
    attributes.forEach(function (att) {
      scale[att] = d3.scaleLinear();
      attExtent = d3.extent(data, function (d) {return get_inner_field_value(d, att)});
      scale[att].domain(attExtent).range([5,95]);
    })

    x = d3.scaleBand().rangeRound([0, width]).padding(1)
    x.domain(axisLabels);

    y = d3.scaleBand().rangeRound([0, width]).padding(1)
    y.domain(axisLabels);

    var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x-axis
    x_axis = g.append("g")
          .attr("class", "axis axis-x")
          // .attr("transform", "translate(0," + height + ")")
          .call(d3.axisTop(x).ticks(10))

    //Rotate x-axis, center labels
    x_axis.selectAll("text")
          .style('text-anchor', 'end')
          .attr('transform', 'translate(-50)rotate(90 0 -10)')

    //Remove exess stuff
    x_axis.selectAll(".tick line").remove();
    x_axis.select("path").remove()

    //y-axis
    y_axis = g.append("g")
          .attr("class", "axis axis-y")
          .call(d3.axisLeft(y).ticks(10))

    //Center labels
    y_axis.selectAll("text")
          .style('text-anchor', 'end')
          .attr('transform', 'translate(0,-50)')

    y_axis.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Frequency");

    //Remove exess stuff
    y_axis.selectAll(".tick line").remove();
    y_axis.select("path").remove()

    var g_2 = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //bind the matrix array to a grid of g elements
    g_2.selectAll("g")
    .data(attributeMatrix)
    .enter()
    .append("g")
    .attr("transform", function (d) {return "translate(" + (d.x * 100) + "," + (d.y * 100) + ")" });

    g_2.selectAll("g")
    .each(function (matrix, i) {
      //index i is only used for coloring

      // console.log(matrix.a)
      // row = data[Math.floor(i / 10)]
      // current_attribute = attributes[i % 10]
      // corr_coef = row[current_attribute]
      
      // console.log("\n")

      //background/border
      d3.select(this).append("rect").style("fill", "White").style("stroke", "black").style("stroke-width", 1)
      .attr("height", 100)
      .attr("width", 100);

      // //label
      // d3.select(this).append("text")
      // .attr("x", 50)
      // .style("text-anchor", "middle")
      // .attr("y", 15)
      // .text(matrix.a + " - " + matrix.b);

      //scatterplot points
      d3.select(this).selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 2)
      .style("fill", colors(i))
      .attr("cx", function (d) {return scale[matrix.a](get_inner_field_value(d, matrix.a))})
      .attr("cy", function (d) {return 95 - scale[matrix.b](get_inner_field_value(d, matrix.b))})
    })
  }
});