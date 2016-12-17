$.getScript("/static/scripts/helper_methods.js", function() {
  var selected_vars_A = ["user.followers_count","user.followers_count","user.followers_count","user.followers_count"]
  var selected_vars_B = ["user.statuses_count","user.favourites_count","user.friends_count","retweeted_status.user.statuses_count"]

  var svg = d3.selectAll(".graph-container").select("svg"),
      margin = {top: 30, right: 20, bottom: 30, left: 60},
      width = 500 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // add the graph canvas to the body of the webpage
  svg = svg.attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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

  // $('#clear-brush').on('click', function() {
  //   svg.selectAll("*").remove();
  //   svg.each(function() {
  //     var id = d3.select(this.parentNode).attr("id").split("-")[1]
  //     selected_var_A = selected_vars_A[id]
  //     selected_var_B = selected_vars_B[id]
  //     renderVisuals(this, selected_var_A, selected_var_B)
  //   });
  // });
  $('.range-size-select').on('keyup', function (e) {
      if (e.keyCode == 13) {
        svg.selectAll("*").remove();
        svg.each(function() {
          var id = d3.select(this.parentNode).attr("id").split("-")[1]
          selected_var_A = selected_vars_A[id]
          selected_var_B = selected_vars_B[id]
          renderVisuals(this, selected_var_A, selected_var_B)
        });
      }
  });

  function renderAllVisuals(brush_type) {
    brush_type_css = $("#brush_type_css")
    console.log(brush_type_css)
    if (brush_type_css.length === 0) {
      $("<style id='brush_type_css' type='text/css'> circle.hidden { fill: #ccc !important; display: block !important; } </style>").appendTo("head");
    }
    else if (brush_type === "BRUSH_TYPE_HIGHLIGHT") {
      brush_type_css.replaceWith("<style id='brush_type_css' type='text/css'> circle.hidden { fill: #ccc !important; display: block !important; } </style>")
    }
    else if (brush_type === "BRUSH_TYPE_FILTER") {
      brush_type_css.replaceWith("<style id='brush_type_css' type='text/css'> circle.hidden { display: none !important; } </style>")
    }

    // Render multiple graphs
    svg.selectAll("*").remove();
    svg.each(function() {
      var id = d3.select(this.parentNode).attr("id").split("-")[1]
      selected_var_A = selected_vars_A[id]
      selected_var_B = selected_vars_B[id]
      renderVisuals(this, selected_var_A, selected_var_B, brush_type)
    });
  }

  renderAllVisuals("BRUSH_TYPE_HIGHLIGHT")

  function renderVisuals(svg, selected_var_A, selected_var_B, brush_type) {
    // load data
    $.getJSON("/static/500_tweets_sample_trump_formatted_augmented.json", function(data) {
      var tweets = data.tweets

      svg = d3.select(svg)

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
          xScale.domain([d3.min(tweets, xValue), max_range_A]);
        }
        else {
          xScale.domain([d3.min(tweets, xValue), d3.max(tweets, xValue)]).nice();
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
          yScale.domain([d3.min(tweets, yValue), max_range_B]);
        }
        else {
          yScale.domain([d3.min(tweets, yValue), d3.max(tweets, yValue)]).nice();
        }
      }
      else {
        yScale = d3.scaleBand().rangeRound([0, height]).padding(1) // value -> display
        yScale.domain(plot_terms_B);
      }
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.axisLeft().scale(yScale);

      var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start", brushstart)
        .on("brush", brushmove)
        .on("end", brushend);

      var gBrush = svg.append("g")
          .attr("class", "brush")
          .call(brush);

      svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px")
        .style("font-weight", "bold") 
        .text(selected_var_A + " vs " + selected_var_B)

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

      // Clear the previously-active brush, if any.
      function brushstart(p) {
        var selection = d3.event.selection;
        // console.log(selection)
      }

      // Highlight the selected circles.
      function brushmove() {
        var selection = d3.event.selection;
        if (selection) {
          selectionXStart = xScale.invert(selection[0][0])
          selectionXEnd = xScale.invert(selection[1][0])
          //Fucking y values are inversed. WHAT.
          selectionYStart = yScale.invert(selection[1][1])
          selectionYEnd = yScale.invert(selection[0][1])
          // console.log(selection)
          // console.log("selectionXStart: " + selectionXStart)
          // console.log("selectionXEnd: " + selectionXEnd)
          // console.log("selectionYStart: " + selectionYStart)
          // console.log("selectionYEnd: " + selectionYEnd)
          circles = d3.selectAll(".graph-container").selectAll("svg").selectAll("g").selectAll("circle")
          circles.classed("hidden", function(d) {
            xVal = xValue(d)
            yVal = yValue(d)
            var inXSelection = selectionXStart < xVal && xVal < selectionXEnd;
            var inYSelection = selectionYStart < yVal && yVal < selectionYEnd;
            
            return !inXSelection || !inYSelection
          });
        }
      }

      // If the brush is empty, select all circles.
      function brushend() {
        var selection = d3.event.selection;
        // console.log(selection)
        if (selection === null) {
          circles = d3.selectAll(".graph-container").selectAll("svg").selectAll("g").selectAll("circle")
          circles.classed("hidden", false);
        }
      }
    });
  }

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

  // Reload graphs with new brush type
  $("#brush_select_dropdown").change(function () {
      console.log(this.value)
      renderAllVisuals(this.value)
  });
});