# AI图像互动游戏

## 项目结构

```
game-ai/
├── backend/
│   ├── main.py                # FastAPI后端服务
│   └── .env                  # 后端环境变量
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # 主要React组件
│   │   ├── App.css          # 组件样式
│   │   ├── main.jsx         # React入口文件
│   │   └── index.css        # 全局样式
│   ├── index.html           # 入口HTML
│   ├── vite.config.js       # Vite配置
│   ├── package.json         # 前端依赖配置
│   └── .env                 # 前端环境变量
├── requirements.txt         # Python依赖
├── package.json            # 根目录配置（用于一键启动）
└── README.md              # 项目说明文档
```

## 技术栈

- 前端：React + Vite
- 后端：Python FastAPI
- AI集成：
  - 图像识别：支持多种大语言模型（Ollama/OpenAI/Gemini）
  - 图像生成：ComfyUI

## 安装说明

### 环境要求

- Node.js >= 18
- Python >= 3.7
- ComfyUI（本地部署）

### 后端设置

1. 安装Python依赖：
```bash
pip install -r requirements.txt
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，填入必要的API密钥
```

### 前端设置

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，填入必要的API端点和密钥
```

## 启动项目

### 开发模式

在项目根目录执行：
```bash
# 安装所有依赖
npm run install:all

# 启动所有服务
npm run start:all
```

前端将在 http://localhost:5173 运行
后端将在 http://localhost:8000 运行

### 关闭服务

```bash
npm run stop:all
```

## 环境变量说明

### 前端 (.env)
```
VITE_API_ENDPOINT=http://localhost:8000/upload
VITE_COMFY_UI_API_ENDPOINT=http://localhost:8001/generate
VITE_OLAMA_API_ENDPOINT=...
VITE_OPENAI_API_ENDPOINT=...
VITE_GEMINI_API_ENDPOINT=...
```

### 后端 (.env)
```
API_KEY=your_api_key_here
API_ENDPOINT=http://localhost:8001
```

## 功能说明

1. 图片上传与预览
2. 多模型选择
   - Ollama（开源本地部署）
   - OpenAI
   - Google Gemini
3. 图片描述生成
4. AI图像生成（通过ComfyUI）
5. 实时处理状态显示

## 贡献

欢迎提交问题和改进建议！

## 许可

MIT
