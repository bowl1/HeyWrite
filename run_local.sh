#!/usr/bin/env bash

# 启动后端
cd chatbox-backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACK_PID=$!
echo "Backend started with PID $BACK_PID"

# 启动前端（Vite），可通过 VITE_API_URL 指向自定义后端
cd ../chatbox-frontend
VITE_API_URL="${VITE_API_URL:-http://127.0.0.1:8000}" npm run dev

# 前端退出后，停止后端
echo "Frontend exited. Stopping backend..."
kill $BACK_PID
