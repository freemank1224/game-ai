from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional  # 添加这行导入
import requests
import os
from dotenv import load_dotenv
from llm_handlers import LLMFactory
from vision_handler import VisionModelHandler
from comfy_handler import ComfyUIHandler
import base64
import shutil
from pathlib import Path

# 获取项目根目录的绝对路径
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / '.env'

print(f"Looking for .env file at: {ENV_PATH}")
if not ENV_PATH.exists():
    print(f"Warning: .env file not found at {ENV_PATH}")
else:
    print(f"Found .env file at {ENV_PATH}")
    # 使用绝对路径加载环境变量
    load_dotenv(ENV_PATH, override=True)
    print(f"Loaded BACKEND_ENDPOINT: {os.getenv('BACKEND_ENDPOINT')}")

app = FastAPI()

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源
    allow_credentials=False,  # 改为 False，因为使用 "*" 时不能为 True
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 创建图片存储目录（如果不存在）
IMAGES_DIR = Path("static/images")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")

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
    # 检查必要的环境变量
    comfy_output_dir = os.getenv('COMFY_UI_OUTPUT_DIR')
    if not comfy_output_dir:
        print("警告: COMFY_UI_OUTPUT_DIR 环境变量未设置，将使用默认路径")
    else:
        print(f"ComfyUI 输出目录: {comfy_output_dir}")
        if not os.path.exists(comfy_output_dir):
            print(f"警告: ComfyUI 输出目录不存在: {comfy_output_dir}")

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
    """使用ComfyUI生成图片并保存到本地"""
    try:
        # 获取 ComfyUI 生成的图片
        comfy_image_url = await comfy_handler.generate_image(prompt)
        print(f"Debug - ComfyUI returned URL: {comfy_image_url}")
        
        if comfy_image_url:
            # 从 URL 中提取实际的文件名
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(comfy_image_url)
            query_params = parse_qs(parsed_url.query)
            filename = query_params.get('filename', [''])[0]
            
            print(f"Debug - Extracted filename: {filename}")
            
            # 使用环境变量中的输出目录，如果未设置则使用默认路径
            comfy_output_dir = os.getenv('COMFY_UI_OUTPUT_DIR')
            if not comfy_output_dir:
                comfy_output_dir = os.path.join(os.path.expanduser('~'), 'Documents/ComfyUI/output')
                print(f"Debug - Using default output directory: {comfy_output_dir}")
            else:
                print(f"Debug - Using configured output directory: {comfy_output_dir}")
            
            if not os.path.exists(comfy_output_dir):
                print(f"Warning - Directory does not exist: {comfy_output_dir}")
                os.makedirs(comfy_output_dir, exist_ok=True)
                print(f"Created directory: {comfy_output_dir}")
            
            local_comfy_path = os.path.join(comfy_output_dir, filename)
            print(f"Debug - Looking for file at: {local_comfy_path}")
            
            if os.path.exists(local_comfy_path):
                print(f"Debug - File found at {local_comfy_path}")
                # 确保目标目录存在
                os.makedirs(IMAGES_DIR, exist_ok=True)
                
                # 复制到后端静态目录
                dest_path = IMAGES_DIR / filename
                print(f"Debug - Copying to: {dest_path}")
                
                shutil.copy2(local_comfy_path, dest_path)
                print(f"Debug - File copied successfully")
                
                # 返回可访问的URL
                public_url = f"{os.getenv('BACKEND_ENDPOINT')}/static/images/{filename}"
                print(f"Debug - Public URL: {public_url}")
                print(f"Debug - File exists in static dir: {os.path.exists(dest_path)}")  # 添加调试日志
                
                return ResponseModel.success({"image_url": public_url})
            else:
                print(f"Debug - File not found at {local_comfy_path}")
                # 列出目录内容以帮助调试
                if os.path.exists(comfy_output_dir):
                    print(f"Debug - Contents of {comfy_output_dir}:")
                    print(os.listdir(comfy_output_dir))
                else:
                    print(f"Debug - Directory {comfy_output_dir} does not exist")
                raise FileNotFoundError(f"ComfyUI生成的图片未找到: {local_comfy_path}")
        else:
            raise Exception("图片生成失败")
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return ResponseModel.error(str(e))

# 添加一个图片代理接口（可选，用于调试）
@app.get("/proxy-image/{filename}")
async def proxy_image(filename: str):
    """代理 ComfyUI 图片访问"""
    file_path = IMAGES_DIR / filename
    if not file_path.exists():
        return ResponseModel.error("Image not found", 404)
    return FileResponse(file_path)

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

# 添加一个用于测试的端点
@app.get("/test-image/{filename}")
async def test_image(filename: str):
    """测试图片访问"""
    file_path = IMAGES_DIR / filename
    if file_path.exists():
        return FileResponse(file_path)
    return ResponseModel.error("Image not found", 404)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0",     # 修改为监听所有网络接口
        log_level="debug",
        port=8000,
        reload=True,         # 开发模式下启用热重载
        access_log=True
    )

#                 return ResponseModel.error(f"图片生成失败: {str(e)}")
import os
from pathlib import Path

print("Current working directory:", os.getcwd())
print("Script location:", Path(__file__).resolve())
print("Project root:", Path(__file__).resolve().parent.parent)

                
#         except Exception as e:
#             print(f"Debug - Processing error: {str(e)}")
#             return ResponseModel.error(f"处理失败: {str(e)}")
            
#     except Exception as e:
#         print(f"Debug - General error: {str(e)}")
#         return ResponseModel.error(f"生成失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0",     # 修改为监听所有网络接口
        log_level="debug",
        port=8000,
        reload=True,         # 开发模式下启用热重载
        access_log=True
    )
