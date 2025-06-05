#!/bin/bash
echo ">>> Installing requirements..."
pip install -r requirements.txt --verbose
echo ">>> Starting server..."
uvicorn main:app --host=0.0.0.0 --port=8000