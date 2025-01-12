import os
from typing import Optional, Union
import aiohttp
import asyncio
import base64
from tenacity import retry, stop_after_attempt, wait_exponential

class VisionModelHandler:
    def __init__(self):
        self.api_endpoint = os.getenv("VISION_MODEL_API_ENDPOINT")
        self.model = os.getenv("VISION_MODEL", "llama3.2-vision:11b")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def analyze_image(self, image_data: Union[str, bytes], prompt: Optional[str] = None) -> str:
        """
        使用Ollama的llama-3.2-vision模型分析图片
        
        Args:
            image_data: 图片数据（二进制数据）
            prompt: 可选的提示词
            
        Returns:
            str: 分析结果
        """
        try:
            # 转换图片数据为base64
            if isinstance(image_data, bytes):
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            elif isinstance(image_data, str):
                # 如果是base64字符串，直接使用
                image_base64 = image_data
            else:
                raise ValueError("不支持的图片数据格式")

            # 构建Ollama API请求
            headers = {"Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "prompt": prompt or "请描述这张图片",
                "stream": False,
                "images": [image_base64]
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_endpoint, headers=headers, json=payload) as response:
                    if response.status != 200:
                        raise Exception(f"Ollama API请求失败: {response.status}")
                    
                    result = await response.json()
                    return result.get("response", "无法解析图片")

        except aiohttp.ClientError as e:
            raise Exception(f"网络请求错误: {str(e)}")
        except Exception as e:
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