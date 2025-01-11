from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import os
from dotenv import load_dotenv

# 加载环境变量，优先使用自定义环境变量文件
env_file = os.getenv('ENV_FILE', '.env')
load_dotenv(env_file)

app = FastAPI()

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    try:
        # 调用本地Ollama服务
        ollama_response = requests.post(
            os.getenv("OLLAMA_API_ENDPOINT"),
            json={
                "model": os.getenv("OLLAMA_MODEL"),
                "prompt": "Describe this image",
                "image": image.file.read()
            }
        )
        
        # 获取描述并调用ComfyUI
        description = ollama_response.json().get("response")
        comfy_response = requests.post(
            os.getenv("COMFY_UI_API_ENDPOINT"),
            json={"prompt": description}
        )
        
        return JSONResponse(content={
            "description": description,
            "image": comfy_response.json().get("image_url")
        })
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)}, 
            status_code=500
        )
