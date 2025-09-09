#!/usr/bin/env bash
# exit on error
set -o errexit

# upgrade pip to latest version 
python -m pip install --upgrade pip

# This installs all the Python packages listed in the requirements.txt file, 
# which typically specifies the libraries your Python project depends on. 
pip install -r requirements.txt

# Generate Compponents(generate some JSON data or configuration files that the application might need.)
python generate_json_kit.py