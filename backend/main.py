from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import os
from dotenv import load_dotenv
from .llm_handlers import LLMFactory
from .vision_handler import VisionModelHandler
import base64

# 加载环境变量，优先使用自定义环境变量文件
env_file = os.getenv('ENV_FILE', '.env')
load_dotenv(env_file)

app = FastAPI()

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{os.getenv('VITE_PORT', '5173')}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_request_size=10_000_000  # 10MB
)

# 添加在中间件配置后
@app.on_event("startup")
async def startup():
    """应用启动时的初始化操作"""
    # 可以添加数据库连接等初始化操作
    pass

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok"}

# 统一响应格式
class ResponseModel:
    @staticmethod
    def success(data=None, message="success"):
        return JSONResponse(content={
            "code": 200,
            "message": message,
            "data": data
        })

    @staticmethod
    def error(message, code=500):
        return JSONResponse(
            content={
                "code": code,
                "message": message,
                "data": None
            },
            status_code=code
        )

# 创建vision模型处理器实例
vision_handler = VisionModelHandler()

@app.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    """处理图片识别请求"""
    try:
        image_data = await image.read()
        # 使用vision模型分析图片
        description = await vision_handler.analyze_image(image_data)
        
        return ResponseModel.success({"description": description})
    except Exception as e:
        return ResponseModel.error(str(e))

@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    """处理图片上传并生成新图片"""
    try:
        # 先用vision模型分析图片
        image_data = await image.file.read()
        description = await vision_handler.analyze_image(image_data)
        
        # 调用ComfyUI生成新图像
        comfy_response = requests.post(
            os.getenv("COMFY_UI_API_ENDPOINT"),
            json={"prompt": description}
        )
        
        return ResponseModel.success({
            "description": description,
            "image": comfy_response.json().get("image_url")
        })
    except Exception as e:
        return ResponseModel.error(str(e))

@app.post("/generate-prompt")
async def generate_prompt(objectName: str, model_type: str = Form(...)):
    try:
        llm_handler = LLMFactory.get_handler(model_type)
        prompt = f"Generate a detailed artistic description for creating an image of {objectName}"
        description = await llm_handler.generate_description(None, prompt)
        
        # 调用ComfyUI生成图像
        comfy_response = requests.post(
            os.getenv("COMFY_UI_API_ENDPOINT"),
            json={"prompt": description}
        )
        
        return ResponseModel.success({
            "prompt": description,
            "image": comfy_response.json().get("image_url")
        })
    except Exception as e:
        return ResponseModel.error(str(e))
