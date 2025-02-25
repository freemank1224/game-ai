# AI图像互动游戏
## 功能简介
本项目实现了一个互动式的AI图像辨别游戏，用户通过选择主题词，动态抓取网络图像，然后AI通过观察图像来模仿生成另一个（多个）图像，然后由用户来选择哪个图像是由AI生成的。通过多轮游戏，记分增强趣味性。

**此游戏可以作为图像生成类AI通识教育的教学软件，帮助学习者来辨别AI图像和真实照片的区别，掌握识别AI图像的能力。也可以用于演示AI临摹图像的原理。**

项目支撑灵活的部署方式，既可以在同一台主机上完成全部项目和服务的部署，也可以将生成图像和图像理解模型分离部署，提高响应速度。

## 项目结构
项目采用前后端架构来实现，前端展示页面控件和图像，用来对接用户输入；后端运行一个Python的服务，统一处理用户输入，并完成任务调度。

```
game-ai/
├── backend/
│   └── main.py                # FastAPI后端服务
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # 主要React组件
│   │   ├── App.css          # 组件样式
│   │   ├── main.jsx         # React入口文件
│   │   └── index.css        # 全局样式
│   ├── index.html           # 入口HTML
│   ├── vite.config.js       # Vite配置
│   └── package.json         # 前端依赖配置
├── .env                     # 环境变量配置
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
- Python >= 3.8
- Ollama (本地LLM服务)
- ComfyUI (图像生成服务)

### 几种部署方式对比：
1. **所有服务都部署在同一台主机上：**
   
   ✅ 节省资源，一台主机完成整个项目功能

   ❌ 执行会非常慢，因为要分时跑两个大模型，`Ollama`和`ComfyUI`

   ❌ 配置要求高，`ComfyUI`要求更大的显存才能支撑高质量出图

2. **可以将主程序（前端界面服务+后端Python服务）跑在一个主机上，而`Ollama`和`ComfyUI`分别跑在其它主机上。**
   
   ✅ 减轻主程序服务器的压力，提高整体响应速度
   
   ❌ 需要多台能够运行LLM的服务器，增加成本 

### 后端设置

1. 创建环境并安装Python依赖：
```bash
conda create -n ai_hunter python=3.1x
conda acitivate ai_hunter

pip install -r requirements.txt
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，填入必要的API密钥
```
注意：部署方式通过指定`Ollama`和`ComfyUI`服务器的地址来实现，下面例子就是分别配置后端服务、`Ollama`和`ComfyUI`的地址。如果项目中各个服务都跑在同一台主机上, 则可以将各自IP地址换成 `localhost`：
```bash
# 后端服务配置
BACKEND_HOST=192.168.x.x     # 实际后端IP
BACKEND_PORT=8000

# Ollama服务配置
OLLAMA_HOST=192.168.x.x      # Ollama服务器IP
OLLAMA_PORT=11434

# ComfyUI服务配置
COMFY_HOST=192.168.x.x       # ComfyUI服务器IP
COMFY_PORT=8188
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

### 环境配置

1. 复制环境变量模板并配置：
```bash
cp .env.template .env
# 编辑.env文件，填入必要的API密钥
```

## 启动项目

### 开发模式

在`backend`目录下执行：
```bash
# 后端启动（确保监听所有接口）
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
切换到`frontend`目录下，执行：
```bash
# 启动所有服务
npm run run dev -- --host
```

前端将在 http://localhost:5173 运行，后端将在 http://localhost:8000 运行。
（**如果要在局域网内访问，则前面环境变量要填入主机IP地址**）


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
API_ENDPOINT=http://localhost:8000
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
