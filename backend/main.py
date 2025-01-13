from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional  # 添加这行导入
import requests
import os
from dotenv import load_dotenv
from llm_handlers import LLMFactory
from vision_handler import VisionModelHandler
from comfy_handler import ComfyUIHandler
import base64

# 加载环境变量，优先使用自定义环境变量文件
env_file = os.getenv('ENV_FILE', '.env')
load_dotenv(env_file)

app = FastAPI()

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 临时允许所有来源，仅用于测试
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 单独添加文件大小限制配置
@app.middleware("http")
async def add_request_size_limit(request, call_next):
    if request.method == "POST":
        content_length = request.headers.get("content-length")
        if (content_length and int(content_length) > 10_000_000):  # 10MB
            return JSONResponse(
                status_code=413,
                content={"detail": "File too large. Maximum size allowed is 10MB"}
            )
    response = await call_next(request)
    return response

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

# 创建ComfyUI处理器实例
comfy_handler = ComfyUIHandler()

@app.post("/analyze-image")
async def analyze_image(
    objectName: str = Form(...), 
    image_url: str = Form(...),
    model_type: str = Form(...)
):
    """分析图片生成描述"""
    try:
        description = await vision_handler.analyze_image(
            image_url,
            f"Please describe this {objectName} in detail, focusing on its visual characteristics."
        )
        return ResponseModel.success({"prompt": description})
    except Exception as e:
        return ResponseModel.error(str(e))

@app.post("/generate-image")
async def generate_image(prompt: str = Form(...)):
    """使用ComfyUI生成图片"""
    try:
        ai_image_url = await comfy_handler.generate_image(prompt)
        return ResponseModel.success({"image_url": ai_image_url})
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

# 移除或注释掉原有的generate-prompt路由
# @app.post("/generate-prompt")
# async def generate_prompt(objectName: str = Form(...), image_url: Optional[str] = Form(None)):
#     """从图片生成提示词并生成图片"""
#     try:
#         print(f"Debug - Starting generate_prompt: objectName={objectName}, image_url={image_url}")
        
#         if not image_url:
#             return ResponseModel.error("需要提供图片URL", 400)

#         try:
#             # 1. 生成图片描述
#             description = await vision_handler.analyze_image(
#                 image_url,
#                 f"Please describe this {objectName} in detail, focusing on its visual characteristics."
#             )
#             print(f"Debug - Generated description: {description}")
            
#             # 2. 使用ComfyUI生成图片
#             try:
#                 ai_image_url = await comfy_handler.generate_image(description)
#                 print(f"Debug - Generated image URL: {ai_image_url}")
                
#                 return ResponseModel.success({
#                     "prompt": description,
#                     "image": ai_image_url
#                 })
#             except Exception as e:
#                 print(f"Debug - ComfyUI error: {str(e)}")
#                 return ResponseModel.error(f"图片生成失败: {str(e)}")
                
#         except Exception as e:
#             print(f"Debug - Processing error: {str(e)}")
#             return ResponseModel.error(f"处理失败: {str(e)}")
            
#     except Exception as e:
#         print(f"Debug - General error: {str(e)}")
#         return ResponseModel.error(f"生成失败: {str(e)}")
