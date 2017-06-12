# Trumpviz

A collection of d3 visualizations for Tweets on Trump

![Top Hashtags](/previews/top_hashtags.png?raw=true "Top Hashtags")

## Use Guide

**1 - [Install Miniconda 3.6](http://conda.pydata.org/miniconda.html) (A Python package manager)**

**2 - Create trumpviz virtual environment**

`conda env create -f environment.yml`

**3 - Activate trumpviz environment**

`source activate trumpviz`

**4 - Set Flask environment variables**

`export FLASK_APP=app.py && export FLASK_DEBUG=1`

**5 - Run App**

`flask run`

**6 - Open Visualizations Page**

Navigate to [localhost:5000](http://localhost:5000) from your browser's url bar

## Helpful conda stuff

List environments

`conda info --envs`

Activate an environemnt

`source activate trumpviz`

Deactivate an environemnt

`source deactivate trumpviz`

Delete an environment

`conda remove --name trumpviz --all`

List environment packages

`conda list`

Install a package

`pip install package_name`

Delete a package

`pip uninstall package_name`
