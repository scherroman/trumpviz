$.getScript("/static/scripts/helper_methods.js", function(){

	var svg = d3.select("svg"),
	margin = {top: 50, right: 20, bottom: 100, left: 40},
	width = 1000 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	//Init SVG
	svg.attr("width", width + margin.left + margin.right)
	   .attr("height", height + margin.top + margin.bottom);

	//Init Tooltip
	tip = d3.tip()
	.offset([-10, 0])
	.attr('class', 'd3-tip').html(function(d) { return d.frequency; });
	//Activate Tooltip
	svg.call(tip)

	var g = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	$('#variable-select').on('change', function() {
		selected_var = $('#variable-select').find('option:selected').val();
		is_bin_var = check_is_bin_var(selected_var)
		
		if (is_bin_var) {
			selected_bin_size = $('#bin-size-select').val()
			//Check that bin size is an integer
			if (selected_bin_size > 0 && selected_bin_size % 1 === 0) {
				g.selectAll("*").remove();
		  	renderVisuals()
			}
		}
		else {
			g.selectAll("*").remove();
	  	renderVisuals()
		}
		
	});
	$('#bin-size-select').on('keyup', function (e) {
	    if (e.keyCode == 13) {
	    	selected_var = $('#variable-select').find('option:selected').val();
	    	selected_bin_size = $('#bin-size-select').val()
	    	if (selected_var !== "" && selected_bin_size > 0 && selected_bin_size % 1 === 0) {
	    		g.selectAll("*").remove();
	        renderVisuals()
	      }
	    }
	});

	function renderVisuals () {
		$.getJSON("/static/500_tweets_sample_trump_formatted_augmented.json", function(data) {
			// d['user/statuses_count'] = +d['user/statuses_count']
			// console.log(data)

			tweets = data.tweets

			//Get selected variable & bin value
			selected_bin_size = $('#bin-size-select').val()
			selected_var = $('#variable-select').find('option:selected').val();
			is_bin_var = check_is_bin_var(selected_var)

			//Calculate frequencies for selected variable
			var freqs_array
			if (is_bin_var) {
				freqs_array = generate_bin_freqs_array(tweets, selected_var, selected_bin_size)
			}
			else {
				freqs_array = generate_term_freqs_array(tweets, selected_var)
			}

			//Get selected variable & bin value
			selected_bin_size = $('#bin-size-select').val()
			selected_var = $('#variable-select').find('option:selected').val();
			is_bin_var = check_is_bin_var(selected_var)

			var x
			//For Numerical Data, Use scaleLinear & passed in bin size
			if (is_bin_var) {
				x = d3.scaleLinear().rangeRound([0, width])
				x.domain([0, selected_bin_size * X_AXIS_TICKS]);
			}
			//For text, ignore passed in bin size & use scaleBand w/top 10 occurences as domain
			else {
				freqs_array.sort(compare_freqs)
				bin_terms = []

				for (i = 0; i < freqs_array.length; i++) {
					bin_terms.push(freqs_array[i].term)
				}

				// console.log(bin_terms)

				bin_terms = bin_terms.slice(0,X_AXIS_TICKS_ORDINAL)
				freqs_array = freqs_array.slice(0,X_AXIS_TICKS_ORDINAL)

				x = d3.scaleBand().rangeRound([0, width]).padding(1)
				x.domain(bin_terms);
			}

			max_frequency = Math.max.apply(Math,freqs_array.map(function(o){return o.frequency;}))

			var y = d3.scaleLinear().rangeRound([height, 0]);
			y.domain([0, max_frequency]).nice();

			// console.log(d3.max(data, function(d) { return d['user/statuses_count']; }))

			x_axis = g.append("g")
			  .attr("class", "axis axis-x")
			  .attr("transform", "translate(0," + height + ")")
			  .call(d3.axisBottom(x).ticks(X_AXIS_TICKS));

			if (!is_bin_var) {
			x_axis.selectAll("text")
			  		.style('text-anchor', 'start')
					.attr('transform', 'rotate(45 -10 10)');
			}

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
});