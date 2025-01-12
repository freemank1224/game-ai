import os
from typing import Optional, Union
import aiohttp
import asyncio
import base64
from tenacity import retry, stop_after_attempt, wait_exponential

class VisionModelHandler:
    def __init__(self):
        self.api_endpoint = os.getenv("VISION_MODEL_API_ENDPOINT", "http://localhost:11434/api/generate")
        self.model = os.getenv("VISION_MODEL", "llama3.2-vision:11b")
        print(f"Debug - Vision API Endpoint: {self.api_endpoint}")
        print(f"Debug - Vision Model: {self.model}")

    async def analyze_image(self, image_data: Union[str, bytes], prompt: Optional[str] = None) -> str:
        try:
            print(f"Debug - Analyzing image with prompt: {prompt}")
            
            if isinstance(image_data, str) and image_data.startswith('http'):
                print(f"Debug - Downloading image from URL: {image_data}")
                async with aiohttp.ClientSession() as session:
                    async with session.get(image_data) as response:
                        if response.status != 200:
                            raise Exception(f"Failed to download image: {response.status}")
                        image_bytes = await response.read()
                        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                        print("Debug - Successfully downloaded and encoded image")
            elif isinstance(image_data, bytes):
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            else:
                raise ValueError("不支持的图片数据格式")

            # 构建 Ollama API 请求
            payload = {
                "model": str(self.model),  # 确保模型名称是字符串
                "prompt": str(prompt) if prompt else "请详细描述这张图片，包括主要物体、颜色、形状和风格特征。",
                "stream": False,
                "images": [str(image_base64)]  # 确保图片数据是字符串
            }

            print(f"Debug - Sending request to Ollama API: {self.api_endpoint}")
            print(f"Debug - Request payload: {payload}")

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    str(self.api_endpoint),  # 确保URL是字符串
                    headers={"Content-Type": "application/json"},
                    json=payload
                ) as response:
                    response_text = await response.text()
                    print(f"Debug - Raw response: {response_text}")
                    
                    if response.status != 200:
                        raise Exception(f"Vision API请求失败: {response.status}, {response_text}")
                    
                    result = await response.json()
                    description = result.get("response", "无法解析图片")
                    print(f"Debug - Generated description: {description}")
                    
                    return description

        except Exception as e:
            print(f"Debug - Error in analyze_image: {str(e)}")
            raise Exception(f"图片分析失败: {str(e)}")

    @staticmethod
    async def is_valid_image_url(url: str) -> bool:
        """异步验证图片URL"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.head(url) as response:
                    return (response.status == 200 and 
                           'image' in response.headers.get('content-type', ''))
            except:
                return False