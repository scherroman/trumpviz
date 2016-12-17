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
    d3.csv("/static/pca_plot_xy_pairs_full_numeric_only.csv", function(data){

      var tweets = data

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
              tooltip.html("<b>(" + xValue(d) + ", " + yValue(d) + ")</b><br/>")
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

  d3.select(".container").append("h3").html("Scree Plot")
  var svgB = d3.select(".container").append("svg"),
  margin = {top: 50, right: 20, bottom: 100, left: 40},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  //Init SVG
  svgB.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);

  //Init Tooltip
  tip = d3.tip()
  .offset([-10, 0])
  .attr('class', 'd3-tip').html(function(d) { return d.frequency; });
  //Activate Tooltip
  svgB.call(tip)

  var g = svgB.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function renderScreePlot() {
    d3.csv("/static/pca_plot_evals_full_numeric_only.csv", function(data){
        // d['user/statuses_count'] = +d['user/statuses_count']
        // console.log(data)

        var evals = data

        console.log(evals)

        var freqs_array = []
        for (var i = 0; i < evals.length; i ++) {
          x = evals.length - 1 - i
          // evals[i] = +evals[i]
          evals[x]['eigenvalue'] = +evals[x]['eigenvalue']
          freqs_array.push({term:i + 1, frequency:evals[x]['eigenvalue']}) 
        }

        console.log(freqs_array)

        var x = d3.scaleLinear().rangeRound([0, width])
        x.domain([0, evals.length]);

        max_frequency = Math.max.apply(Math,freqs_array.map(function(o){return o.frequency;}))

        var y = d3.scaleLinear().rangeRound([height, 0]);
        y.domain([0, max_frequency]).nice();

        // console.log(d3.max(data, function(d) { return d['user/statuses_count']; }))

        x_axis = g.append("g")
          .attr("class", "axis axis-x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(evals.length));

        g.append("g")
          .attr("class", "axis axis-y")
          .call(d3.axisLeft(y).ticks(10))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Frequency");

        g.selectAll(".bar")
        .data(freqs_array)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.term) - 25; })
          .attr("y", function(d) { return y(d.frequency); })
          .attr("width", 50)
          .attr("height", function(d) { return height - y(d.frequency); })
          .on('mouseover', function(d) {
            tip.show(d)
            d3.select(this).transition()
              .duration(200)
              .attr("width", 60)
              .attr("transform", "translate(" + -(60 - 50)/2 + ",0)")
            
          })
            .on('mouseout', function(d) {
              tip.hide(d)
            d3.select(this).transition()
              .duration(200)
              .attr("width", 50)
              .attr("transform", "translate(0,0)")
            
          });
      });
  }

  renderScatterplot()
  renderScreePlot()
});




// $.getScript("/static/scripts/helper_methods.js", function() {
//     var margin = {top: 20, right: 20, bottom: 30, left: 50},
//         width = 550 - margin.left - margin.right,
//         height = 550 - margin.top - margin.bottom;

//     var X = d3.scale.linear()
//         .range([0, width]);

//     var Y = d3.scale.linear()
//         .range([height, 0]);


//     var svg = d3.select("#vis").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     var numSamplesPerFrame = 200,
//         numSamples = 0;

//     var xdata = [],
//         ydata = [];
//     var x_mean, y_mean;
//     var data, eigs;

//     // Event binding
//     d3.selectAll("input[name=ax]")
//         .data([[true, true], [false, false], [true, false], [false, true]])
//         .on("change", function(d) {
//           move(d[0], d[1]);
//         });

//     // Draw the normal axes
//     var components = svg.selectAll("line")
//             .data([
//                 [[0.0, 0.5], [1, 0.5], "X"],
//                 [[0.5, 0.0], [0.5, 1], "Y"],
//             ], function(d, i){return d[2];});

//     components.exit().remove();
//     components.enter().append('line')
//         .attr('class', 'ax')
//         .attr('stroke', 'black')
//         .attr('stroke-width', '2px')
//         .attr('x1', function (d) { return X(d[0][0]); })
//         .attr('y1', function (d) { return Y(d[0][1]); })
//         .attr('x2', function (d) { return X(d[1][0]); })
//         .attr('y2', function (d) { return Y(d[1][1]); });

//     function rnd(mean, std){
//         var r = 0;
//         for (var i = 0; i < 10; i++) {
//             r += Math.random() * 2 - 1
//         }
//         return r * std + mean;
//     }

//     function covariance(x_adjust, y_adjust, n){
//         var total = 0;
//         for (var i = 0; i < x_adjust.length; i++) {
//             total += x_adjust[i] * y_adjust[i];
//         }
//         return total / (n-1);
//     }

//     function solve() {
//         // var n = xdata.length;
//         // x_mean = xdata.reduce(function (memo, num) {
//         //     return memo + num;
//         // }, 0) / n;
//         // y_mean = ydata.reduce(function (memo, num) {
//         //     return memo + num;
//         // }, 0) / n;

//         // // Subtract the mean
//         // var x_adjust = xdata.map(function (num) {
//         //     return num - x_mean;
//         // });
//         // var y_adjust = ydata.map(function (num) {
//         //     return num - y_mean;
//         // });
//         // data = [y_adjust, x_adjust];

//         // // Calculate the covariance
//         // var xyc = covariance(x_adjust, y_adjust, n);
//         // var xxc = covariance(x_adjust, x_adjust, n);
//         // var yyc = covariance(y_adjust, y_adjust, n);

//         // var covar = [ [xxc, xyc], [xyc, yyc] ];
//         // d3.selectAll('#covar').html(numeric.prettyPrint(covar));

//         // console.log(covar)

//         d3.selectAll('#covar').html(numeric.prettyPrint(corr_matrix));

//         // Calculate the eigenvectors/eigenvalues
//         // var eig = numeric.eig(covar);
//         var eig = numeric.eig(corr_matrix);
//         // console.log(eig)

//         //Eigenvectors
//         eigs = eig.E.x;
//         //Eigenvalues
//         var eigvals = eig.lambda.x;

//         //Map eigvals to vector
//         var eigvals_and_vectors = {}
//         for (var i = 0; i < eigvals.length; i++) {
//             eigvals_and_vectors[eigvals[i]] = eigs[i]
//         }
//         console.log(eigvals)
//         console.log(eigvals_and_vectors)

//         var eigelements = d3.select("#eigvects").selectAll("div").data(eigs);
//         eigelements.enter().append('div')
//                 .html(function(d){return numeric.prettyPrint(d)});
//         eigelements = d3.select("#eigvals").selectAll("div").data(eigvals);
//         eigelements.enter().append('div')
//                 .html(function(d){return numeric.prettyPrint(d)});

//         //Select top eigvals
//         eigvals.sort(function (a, b) {  return b - a;  });
//         top_eigvals = [eigvals[1], eigvals[2]]
//         console.log("top_eigval_A: " + top_eigvals[0])
//         console.log("top_eigval_B: " + top_eigvals[1])
//         top_eigvect_A = eigvals_and_vectors[top_eigvals[0]]
//         top_eigvect_B = eigvals_and_vectors[top_eigvals[1]]

//         //Set eigs to top 2 eigenvectors
//         eigs = [top_eigvect_A, top_eigvect_B]
//         console.log(eigs)

//         eigelements = d3.select("#select_eigvals").selectAll("div").data(top_eigvals);
//         eigelements.enter().append('div')
//                 .html(function(d){return numeric.prettyPrint(d)});
//         eigelements = d3.select("#select_eigvects").selectAll("div").data(eigs);
//         eigelements.enter().append('div')
//                 .html(function(d){return numeric.prettyPrint(d)});
//     }

//     function plotEigVects(){
//         // Plot eigen vectors centered at the mean
//         var components = svg.selectAll("line.pca")
//                 .data([
//                     [
//                         [x_mean, y_mean],
//                         [x_mean + eigs[0][1], y_mean + eigs[0][0]],
//                         "Y"
//                     ],
//                     [
//                         [x_mean, y_mean],
//                         [x_mean + eigs[1][1], y_mean + eigs[1][0]],
//                         "X"
//                     ]
//                 ], function(d){return d[2];});
//         components.enter().append('line')
//                 .attr('stroke', 'red')
//                 .attr('stroke-width', '2px')
//                 .attr("class", 'pca');
//         components
//                 .transition().ease("linear").duration(2000)
//                 .attr('x1', function (d) { return X(d[0][0]); })
//                 .attr('y1', function (d) { return Y(d[0][1]); })
//                 .attr('x2', function (d) { return X(d[1][0]); })
//                 .attr('y2', function (d) { return Y(d[1][1]); });

//     }

//     function move(useFirst, useSecond){

//         // Form a feature vector
//         var featureVectorRow = [];
//         if(useFirst){
//             featureVectorRow.push(eigs[0]);
//         }
//         if(useSecond){
//             featureVectorRow.push(eigs[1]);
//         }

//         if(!useFirst && !useSecond){
//             // plot the original data
//             plotOriginal();
//             plotEigVects();
//             return;
//         }


//         var finalData = numeric.transpose(numeric.dot(featureVectorRow, data));


//         var n = xdata.length;
//         // Move the axis lines to normal positions
//         var components = svg.selectAll("line.pca")
//                 .data([
//                     [[0.5, 0.5], [1, 0.5], "X"],
//                     [[0.5, 0.5], [0.5, 1], "Y"],
//                 ], function(d, i){return d[2];});

//         components.exit().remove();
//         components.enter().append('line');


//         // plot the new lower dimensional data
//         var circle = svg.selectAll("circle");
//            //.data(finalData, function(d, i){ return d;});

//         circle
//             .transition().ease("linear").duration(2000)
//             .attr('cx', function(d, i){
//                     if(useFirst && useSecond) {
//                         return X(0.5 + finalData[i][1]);
//                     }
//                     if(useSecond) {
//                         return X(0.5 + finalData[i][0]);
//                     }
//                     if (useFirst){
//                         return X(0.5);//X(i/n);
//                     }
//                 })
//             .attr('cy', function(d, i){
//                 if(useFirst && useSecond) {
//                     return Y(0.5 + finalData[i][0]);
//                 }
//                 if (useFirst){
//                     return Y(0.5 + finalData[i][0]);
//                 }
//                 if (useSecond){
//                     return Y(0.5);
//                 }

//                 });

//         components
//             .transition().ease("linear").duration(2000)
//             .attr('x1', function (d) { return X(d[0][0]); })
//             .attr('y1', function (d) { return Y(d[0][1]); })
//             .attr('x2', function (d) { return X(d[1][0]); })
//             .attr('y2', function (d) { return Y(d[1][1]); });
//     }

//     function plotOriginal(){
//         var xycoords = numeric.transpose([xdata, ydata]);
//         var circle = svg.selectAll("circle")
//           .data(xycoords, function(d, i) { return d; });

//         circle.enter().append("circle")
//             .attr("r", 2)
//             .attr("fill", 'steelblue');

//         circle
//             .transition().ease("linear").duration(2000)
//             .attr("cx", function(d, i) { return X(d[0]); })
//             .attr("cy", function(d, i){return Y(d[1]);});

//         circle.exit().remove();
//     }

//     // function createData() {
//     //     eigs = [];
//     //     xdata = [];
//     //     ydata = [];
//     //     numSamples = 0;

//     //     var amean = parseFloat(document.getElementById('amean').value);
//     //     var astd = parseFloat(document.getElementById('astd').value);
//     //     var bmean = parseFloat(document.getElementById('bmean').value);
//     //     var bstd = parseFloat(document.getElementById('bstd').value);


//     //     var ax = parseFloat(document.getElementById('ax').value);
//     //     var ay = parseFloat(document.getElementById('ay').value);
//     //     var bx = parseFloat(document.getElementById('bx').value);
//     //     var by = parseFloat(document.getElementById('by').value);

//     //     d3.timer(function () {
//     //         for (var i = 0; i < numSamplesPerFrame; ++i) {
//     //             var a = rnd(amean, astd),
//     //                 b = rnd(bmean, bstd);

//     //             var x = ax * a + bx * b,
//     //                 y = ay * a + by * b;

//     //             xdata.push(x);
//     //             ydata.push(y);
//     //         }

//     //         // console.log(xdata)
//     //         // console.log(ydata)

//     //         plotOriginal();

//     //         if (++numSamples > 10) {
//     //             solve();
//     //             plotEigVects();
//     //             return true;
//     //         }
//     //     });
//     // }

//     function serveData(data) {
//         eigs = [];
//         xdata = [];
//         ydata = [];
//         numSamples = 0;

//         corr_matrix = convert_to_square_matrix(data)

//         console.log(data)
//         console.log(corr_matrix)

//         d3.timer(function () {
//             // plotOriginal();

//             if (++numSamples > 10) {
//                 solve();
//                 plotEigVects();
//                 return true;
//             }
//         });
//     }

//     function convert_to_square_matrix(data) {
//         square_matrix = []
//         data.forEach(function(row) {
//             row_array = []
//             for (var key in row) {
//                 if (row.hasOwnProperty(key) && key !== "") {
//                     console.log(key)
//                     row[key] = +row[key]
//                     row_array.push(row[key])
//                 }
//             } 
//             console.log("\n")
//             square_matrix.push(row_array)
//         });

//         return square_matrix
//     }

//     $.getJSON("/static/500_tweets_sample_trump_formatted_augmented.json", get_vectors_from_data_points);
//     d3.csv("/static/500_tweets_sample_trump_formatted_augmented_correlation_matrix_numeric_only.csv", serveData);
//     // createData();
// });