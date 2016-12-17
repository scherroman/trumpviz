from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def serve_home_page():
	return render_template('trumpviz.html')

@app.route('/graph/<string:graph_type>')
def serve_graph(graph_type):
	graph_type_name = None
	include_d3_v4 = True
	if (graph_type == "bar_chart_graph"):
		graph_type_name = "Frequency Bar Charts"
	elif (graph_type == "bivariate_scatterplot_graph"):
		graph_type_name = "Bivariate Scatterplot"
	elif (graph_type == "correlation_matrix_graph"):
		graph_type_name = "Correlation Matrix"
	elif (graph_type == "scatterplot_matrix_graph"):
		graph_type_name = "Scatterplot Matrix"
	elif (graph_type == "parallel_coordinates_graph"):
		graph_type_name = "Parallel Coordinates"
		include_d3_v4 = False
	elif (graph_type == "pca_plot_graph"):
		graph_type_name = "PCA Plot"
	elif (graph_type == "mds_data_display_graph"):
		graph_type_name = "MDS Data Display"
	elif (graph_type == "mds_attribute_display_graph"):
		graph_type_name = "MDS Attribute Display"
	elif (graph_type == "dashboard"):
		graph_type_name = "Dashboard"

	return render_template('trumpviz.html', graph_type=graph_type, graph_type_name=graph_type_name, include_d3_v4=include_d3_v4)