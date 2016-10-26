var X_AXIS_TICKS = 15
var X_AXIS_TICKS_ORDINAL = 15

function check_is_bin_var(selected_var) {
	if (selected_var === "entities.hashtags" || selected_var === "entities.user_mentions" || selected_var === "entities.emojis" || selected_var === "retweeted_status.user.screen_name" || selected_var === "es_is_retweet_status") {
		return false
	}
	else {
		return true
	}
}

//For Numerical fields
function generate_bin_freqs_array(data, selected_var, selected_bin_size) {
	var freqs_array = []
	for (i = 1; i <= X_AXIS_TICKS; i++) {
		freqs_array.push({term:selected_bin_size * i, frequency:0})
	}

	// console.log(freqs_array)

	for (i = 0; i < data.length; i++) {
		var tweet = data[i]
		//Get value of selected var for each tweet if it exists
		var value = get_inner_field_value(tweet, selected_var)

		if (value) {
			bin = Math.floor(value/selected_bin_size)

			// console.log(bin)
			// console.log(freqs_array[Math.ceil(value/selected_bin_size)])
			// console.log(selected_var.split('.').reduce((t,x)=>t[x], tweet))

			if (bin <= X_AXIS_TICKS) {
				// console.log(bin)
				//Catch edge case for bin === X_AXIS_TICKS
				bin = Math.min(bin,X_AXIS_TICKS - 1)
				freqs_array[bin].frequency++
			}
		}
	}
	// console.log(freqs_array)

	return freqs_array
}

//For Other fields (e.g text & booleans)
function generate_term_freqs_array(data, selected_var) {
	var freqs_array = []
	var bins_dict = {}

	// console.log(selected_var)

	for (var i = 0; i < data.length; i++) {
		var tweet = data[i]
		//Get value of selected var for each tweet if it exists
		if (selected_var === "entities.hashtags" || selected_var === "entities.user_mentions" || selected_var === "entities.emojis") {
			var entities = get_inner_field_value(tweet, selected_var)
			
			// console.log(entities)
			
			for (var x = 0; x < entities.length; x++) {
				var value
				if (selected_var === "entities.hashtags") {
					value = entities[x]["text"]
				}
				else if (selected_var === "entities.user_mentions") {
					// console.log(entities[x]["screen_name"])
					value = entities[x]["screen_name"]
				}
				else if (selected_var === "entities.emojis") {
					value = entities[x]
				}

				if (!(value in bins_dict)) {
					bins_dict[value] = 1
				}
				else {
					bins_dict[value]++
				}
			}
		}
		else {
			var value = get_inner_field_value(tweet, selected_var)

			if (!(value in bins_dict)) {
				bins_dict[value] = 1
			}
			else {
				bins_dict[value]++
			}
		}
	}

	// console.log(bins_dict)

	for (var bin in bins_dict) {
		freq = bins_dict[bin]
		freqs_array.push({term:bin, frequency:freq})
	}

	// console.log(freqs_array)

	return freqs_array

	// for (i = 1; i <= X_AXIS_TICKS; i++) {
	// 	freqs_array.push({term:selected_bin_size * i, frequency:0})
	// }
}

function compare_freqs(a,b) {
	if (a.frequency < b.frequency)
    return 1;
  if (a.frequency > b.frequency)
    return -1;
  return 0;
}

function get_inner_field_value(object, field) {
	var value
	try {
	  value = field.split('.').reduce((t,x)=>t[x], object)
	} catch (err) {}

	return value
}

function assign(obj, prop, value) {
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        var e = prop.shift();
        assign(obj[e] =
                 Object.prototype.toString.call(obj[e]) === "[object Object]"
                 ? obj[e]
                 : {},
               prop,
               value);
    } else
        obj[prop[0]] = value;
}
