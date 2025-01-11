# 互动游戏项目

## 项目结构

```
game-ai/
├── backend/
│   ├── main.py                # FastAPI后端服务
│   ├── requirements.txt       # Python依赖
│   └── .env                  # 后端环境变量
├── frontend/
│   ├── node_modules/         # npm包（git忽略）
│   ├── public/
│   │   └── index.html       # React入口HTML
│   ├── src/
│   │   ├── App.js          # 主要React组件
│   │   ├── App.css         # 组件样式
│   │   ├── index.js        # React入口文件
│   │   └── index.css       # 全局样式
│   ├── package.json        # 前端依赖配置
│   └── .env               # 前端环境变量
└── package.json           # 根目录配置（用于一键启动）
```

## 安装说明

### 后端

1. 确保已安装Python 3.7或更高版本。
2. 导航到`backend`目录并安装依赖包：
    ```sh
    cd backend
    pip install -r requirements.txt
    ```
3. 配置后端环境变量：
    - 复制`.env.example`到`.env`
    - 填入必要的API密钥和端点

4. 启动FastAPI服务器：
    ```sh
    uvicorn main:app --reload --port 8000
    ```

### 前端

1. 确保已安装Node.js和npm。
2. 导航到`frontend`目录并安装依赖包：
    ```sh
    cd frontend
    npm install
    ```
3. 配置前端环境变量：
    - 复制`.env.example`到`.env`
    - 填入必要的API端点和密钥

4. 启动React开发服务器：
    ```sh
    npm start
    ```

### 一键启动

在项目根目录执行：
```sh
npm run start:all
```

### 一键关闭

在项目根目录执行：
```sh
npm run stop:all
```

## 功能说明

1. 图片上传与显示
2. 多种大语言模型支持（Olama、OpenAI、Google Gemini）
3. 图片描述生成
4. ComfyUI集成
5. 实时状态反馈

## 环境变量配置

### 前端 (.env)
- REACT_APP_API_ENDPOINT
- REACT_APP_COMFY_UI_API_ENDPOINT
- REACT_APP_OLAMA_API_ENDPOINT
- REACT_APP_OPENAI_API_ENDPOINT
- REACT_APP_GEMINI_API_ENDPOINT
- 相应的API密钥

### 后端 (.env)
- API_KEY
- API_ENDPOINT

## 贡献

欢迎提交问题和拉取请求来改进本项目。
