from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # 加载.env文件

app = FastAPI()

@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    try:
        # 将图片文件发送到大语言模型API
        files = {"image": (image.filename, image.file, image.content_type)}
        response = requests.post(
            os.getenv("API_ENDPOINT"),
            files=files,
            headers={"Authorization": f"Bearer {os.getenv('API_KEY')}"}
        )
        response_data = response.json()
        response = requests.post(
        return JSONResponse(content=response_data)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

            os.getenv("API_ENDPOINT"),
            files=files,
            headers={"Authorization": f"Bearer {os.getenv('API_KEY')}"}
        )
        response_data = response.json()
        return JSONResponse(content=response_data)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
