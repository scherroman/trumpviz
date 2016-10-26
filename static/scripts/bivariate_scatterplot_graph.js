$.getScript("/static/scripts/helper_methods.js", function() {
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

  // setup fill color
  // var cValue = function(d) { return d.Manufacturer;},
  //     color = d3.scaleOrdinal(d3.schemeCategory10);

  $('select').on('change', function() {
    selected_var_A = $('.variable-select:eq(0)').find('option:selected').val();
    selected_var_B = $('.variable-select:eq(1)').find('option:selected').val();
  
    if (selected_var_A && selected_var_B) {
      svg.selectAll("*").remove();
      renderVisuals()
    }
  });
  $('.range-size-select').on('keyup', function (e) {
      if (e.keyCode == 13) {
        selected_var_A = $('.variable-select:eq(0)').find('option:selected').val();
        selected_var_B = $('.variable-select:eq(1)').find('option:selected').val();
        
        if (selected_var_A && selected_var_B) {
          svg.selectAll("*").remove();
          renderVisuals()
        }
      }
  });

  function renderVisuals() {
    // load data
    $.getJSON("/static/500_tweets_sample_trump_formatted_augmented.json", function(data) {

      var tweets = data.tweets

      var selected_var_A = $('.variable-select:eq(0)').find('option:selected').val();
      var selected_var_B = $('.variable-select:eq(1)').find('option:selected').val();
      var is_bin_var_A = check_is_bin_var(selected_var_A)
      var is_bin_var_B = check_is_bin_var(selected_var_B)

      max_range_A = $('.range-size-select:eq(0)').val()
      max_range_B = $('.range-size-select:eq(1)').val()

      //Remove any data points that don't contain a selected field
      tweets = cull_irrelevant_data_points(tweets, selected_var_A, selected_var_B)

      var freqs_array_A, freqs_array_B, plot_terms_A, plot_terms_B
      //Prepare numeric data
      if (is_bin_var_A) {
        // change string into number
        tweets.forEach(function(tweet) {
          var value = get_inner_field_value(tweet, selected_var_A)
          tweet[selected_var_A] = +value;
        });
      }
      //Prepare string data
      else {
        //Order by most frequent terms
        freqs_array_A = generate_term_freqs_array(tweets, selected_var_A)
        freqs_array_A.sort(compare_freqs)

        //Find terms to plot on graph
        plot_terms_A = []
        for (i = 0; i < freqs_array_A.length; i++) {
          plot_terms_A.push(freqs_array_A[i].term)
        }

        // console.log(plot_terms)

        plot_terms_A = plot_terms_A.slice(0,X_AXIS_TICKS_ORDINAL)
        freqs_array_A = freqs_array_A.slice(0,X_AXIS_TICKS_ORDINAL)
      }
      //Prepare numeric data
      if (is_bin_var_B) {
        // change string into number
        tweets.forEach(function(tweet) {
          var value = get_inner_field_value(tweet, selected_var_B)
          tweet[selected_var_B] = +value;
        });
      }
      //Prepare string data
      else {
        //Order by most frequent terms
        freqs_array_B = generate_term_freqs_array(tweets, selected_var_B)
        freqs_array_B.sort(compare_freqs)

        //Find terms to plot on graph
        plot_terms_B = []
        for (i = 0; i < freqs_array_B.length; i++) {
          plot_terms_B.push(freqs_array_B[i].term)
        }

        // console.log(plot_terms)

        plot_terms_B = plot_terms_B.slice(0,X_AXIS_TICKS_ORDINAL)
        freqs_array_B = freqs_array_B.slice(0,X_AXIS_TICKS_ORDINAL)
      }

      //Expand data points for [array of string] fields
      //Remove any data points where one or more values don't appear in relevant entities arrays
      if (!is_bin_var_A) {
        tweets = expand_relevant_data_points(tweets, selected_var_A)
        tweets = cull_irrelevant_entities(tweets, selected_var_A, plot_terms_A)
      }
      if (!is_bin_var_B) {
        tweets = expand_relevant_data_points(tweets, selected_var_B)
        tweets = cull_irrelevant_entities(tweets, selected_var_B, plot_terms_B)
      }

      // setup x
      var xValue = function(d) { return get_inner_field_value(d, selected_var_A) } // data -> value
      var xScale
      if (is_bin_var_A) {
        xScale = d3.scaleLinear().range([0, width]) // value -> display
        //If user specified the max range
        if (max_range_A) {
          xScale.domain([d3.min(tweets, xValue)-1, max_range_A]);
        }
        else {
          xScale.domain([d3.min(tweets, xValue)-1, d3.max(tweets, xValue)+1]).nice();
        }
      }
      else {
        xScale = d3.scaleBand().rangeRound([0, width]).padding(1) // value -> display
        xScale.domain(plot_terms_A);
      }
      var xMap = function(d) { return xScale(xValue(d));} // data -> display
      var xAxis = d3.axisBottom().scale(xScale);

      // setup y
      var yValue = function(d) { return get_inner_field_value(d, selected_var_B) } // data -> value
      var yScale
      if (is_bin_var_B) {
        yScale = d3.scaleLinear().range([height, 0]) // value -> display
        //If user specified the max range
        if (max_range_B) {
          yScale.domain([d3.min(tweets, yValue)-1, max_range_B]);
        }
        else {
          yScale.domain([d3.min(tweets, yValue)-1, d3.max(tweets, yValue)+1]).nice();
        }
      }
      else {
        yScale = d3.scaleBand().rangeRound([0, height]).padding(1) // value -> display
        yScale.domain(plot_terms_B);
      }
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

      if (!is_bin_var_A) {
      xAxisEl.selectAll("text")
          .style('text-anchor', 'start')
          .attr('transform', 'rotate(45 -10 10)');
      }

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
              tooltip.html("<b>(" + xValue(d) + ", " + yValue(d) + ")</b><br/>" + 
                            get_inner_field_value(d, "user.screen_name") + "<br/>" + d["text"] + "<br/>")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // // draw legend
      // var legend = svg.selectAll(".legend")
      //     .data(color.domain())
      //   .enter().append("g")
      //     .attr("class", "legend")
      //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // // draw legend colored rectangles
      // legend.append("rect")
      //     .attr("x", width - 18)
      //     .attr("width", 18)
      //     .attr("height", 18)
      //     .style("fill", color);

      // // draw legend text
      // legend.append("text")
      //     .attr("x", width - 24)
      //     .attr("y", 9)
      //     .attr("dy", ".35em")
      //     .style("text-anchor", "end")
      //     .text(function(d) { return d;})
    });

  //Remove any data points where one of the variables doesn't exist or have a value
  function cull_irrelevant_data_points(tweets, selected_var_A, selected_var_B) {
    tweets_final = []
    tweets.forEach(function(tweet) {
      var value_A = get_inner_field_value(tweet, selected_var_A)
      var value_B = get_inner_field_value(tweet, selected_var_B)
      if (value_A !== undefined && value_B !== undefined) {
        tweets_final.push(tweet)
      }
    });
    return tweets_final
  }

  //Remove any data points where one or more values don't appear in relevant entities arrays
  function cull_irrelevant_entities(tweets, selected_var, entities) {
    tweets_final = []
    tweets.forEach(function(tweet) {
      var value = get_inner_field_value(tweet, selected_var)
      value = value.toString()
      if (entities.indexOf(value) === -1) {
        return
      }
      tweets_final.push(tweet)
    });
    return tweets_final
  }

  //For any data points containing an array of values for a selected variable,
  //split the data point into as many data points as there are values
  function expand_relevant_data_points(tweets, selected_var) {
    tweets_final = []
    tweets.forEach(function(tweet) {
      var entity = get_inner_field_value(tweet, selected_var)
      //If value is an array
      if(Object.prototype.toString.call(entity) === '[object Array]') {
        //For each value in the entity array, create new data point,
        //on new data point, replace originating array with that value
        //put that new data point in the result set
        entity.forEach(function(object) {
          var value
          if (selected_var === "entities.hashtags") {
            value = object.text
          }
          else if (selected_var === "entities.user_mentions") {
            value = object.screen_name
          }
          new_tweet = tweet
          assign(new_tweet, selected_var, value)
          tweets_final.push(new_tweet)
        });
      }
      else {
        tweets_final.push(tweet)
      }
    });
    return tweets_final
  }

  // function renderVisuals() {
  //   // load data
  //   d3.csv("/static/cereal.csv", function(error, data) {

  //     selected_var_A = $('.variable-select:eq(0)').find('option:selected').val();
  //     selected_var_B = $('.variable-select:eq(1)').find('option:selected').val();
  //     is_bin_var_A = check_is_bin_var(selected_var_A)
  //     is_bin_var_B = check_is_bin_var(selected_var_B)

  //     // change string (from CSV) into number format
  //     data.forEach(function(d) {
  //       d.Calories = +d.Calories;
  //       d["Protein (g)"] = +d["Protein (g)"];
  //   //    console.log(d);
  //     });

  //     // setup x
  //     var xValue
  //     var xScale
  //     var xValue = function(d) { return d.Manufacturer;}, // data -> value
  //         xScale = d3.scaleBand().rangeRound([0, width]).padding(1), // value -> display
  //     // var xValue = function(d) { return d.Calories;}, // data -> value
  //     //     xScale = d3.scaleLinear().range([0, width]), // value -> display
  //         xMap = function(d) { return xScale(xValue(d));}, // data -> display
  //         xAxis = d3.axisBottom().scale(xScale);

  //     // setup y
  //     var yValue = function(d) { return d["Protein (g)"];}, // data -> value
  //         yScale = d3.scaleLinear().range([height, 0]), // value -> display
  //         yMap = function(d) { return yScale(yValue(d));}, // data -> display
  //         yAxis = d3.axisLeft().scale(yScale);

  //     // don't want dots overlapping axis, so add in buffer to data domain
  //     xScale.domain(data.map(function (d) {return d.Manufacturer; }));
  //     // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  //     yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  //     // x-axis
  //     svg.append("g")
  //         .attr("class", "x axis")
  //         .attr("transform", "translate(0," + height + ")")
  //         .call(xAxis)
  //       .append("text")
  //         .attr("class", "label")
  //         .attr("x", width)
  //         .attr("y", -6)
  //         .style("text-anchor", "end")
  //         .text("Calories");

  //     // y-axis
  //     svg.append("g")
  //         .attr("class", "y axis")
  //         .call(yAxis)
  //       .append("text")
  //         .attr("class", "label")
  //         .attr("transform", "rotate(-90)")
  //         .attr("y", 6)
  //         .attr("dy", ".71em")
  //         .style("text-anchor", "end")
  //         .text("Protein (g)");

  //     // draw dots
  //     svg.selectAll(".dot")
  //         .data(data)
  //       .enter().append("circle")
  //         .attr("class", "dot")
  //         .attr("r", 3.5)
  //         .attr("cx", xMap)
  //         .attr("cy", yMap)
  //         .attr("r", 12)
  //         // .style("fill", function(d) { return color(cValue(d));}) 
  //         .on("mouseover", function(d) {
  //             tooltip.transition()
  //                  .duration(200)
  //                  .style("opacity", .9);
  //             tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d) 
  //             + ", " + yValue(d) + ")")
  //                  .style("left", (d3.event.pageX + 5) + "px")
  //                  .style("top", (d3.event.pageY - 28) + "px");
  //         })
  //         .on("mouseout", function(d) {
  //             tooltip.transition()
  //                  .duration(500)
  //                  .style("opacity", 0);
  //         });

  //     // // draw legend
  //     // var legend = svg.selectAll(".legend")
  //     //     .data(color.domain())
  //     //   .enter().append("g")
  //     //     .attr("class", "legend")
  //     //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  //     // // draw legend colored rectangles
  //     // legend.append("rect")
  //     //     .attr("x", width - 18)
  //     //     .attr("width", 18)
  //     //     .attr("height", 18)
  //     //     .style("fill", color);

  //     // // draw legend text
  //     // legend.append("text")
  //     //     .attr("x", width - 24)
  //     //     .attr("y", 9)
  //     //     .attr("dy", ".35em")
  //     //     .style("text-anchor", "end")
  //     //     .text(function(d) { return d;})
  //   });
  }
});