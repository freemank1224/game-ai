#!/bin/bash

# 切换到项目根目录
cd "$(dirname "$0")"

# 启动后端服务
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
