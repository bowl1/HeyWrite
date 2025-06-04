=

# 启动后端
cd chatbox-backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACK_PID=$!
echo "Backend started with PID $BACK_PID"

# 启动前端
cd ../chatbox-frontend
npm run start

# 前端关闭后，再杀后端
echo "Frontend exited. Stopping backend..."
kill $BACK_PID