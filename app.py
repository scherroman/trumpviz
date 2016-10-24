from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def serve_home_page():
  return render_template('trumpviz.html')

@app.route('/graph/<string:graph_type>')
def serve_graph(graph_type):
	graph_type_name = None
	if (graph_type == "bar_chart_graph"):
		graph_type_name = "Frequency Bar Charts"
	elif (graph_type == "bivariate_scatterplot_graph"):
		graph_type_name = "Bivariate Scatterplot"
    
	return render_template('trumpviz.html', graph_type=graph_type, graph_type_name=graph_type_name)