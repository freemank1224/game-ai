from abc import ABC, abstractmethod
import os
import requests
import base64
from PIL import Image
import io
import openai
import asyncio
from typing import Optional, Union
from tenacity import retry, stop_after_attempt, wait_exponential

import google.generativeai as genai

class LLMHandler(ABC):
    """大语言模型处理器的抽象基类"""
    @abstractmethod
    async def generate_description(self, image_data: Optional[str], prompt: str) -> str:
        """生成图片或文本描述
        Args:
            image_data: 可选的base64编码图片数据
            prompt: 提示词
        Returns:
            str: 生成的描述文本
        """
        pass

    async def _handle_timeout(self, coroutine, timeout: int = 30):
        """处理超时的通用方法"""
        try:
            return await asyncio.wait_for(coroutine, timeout=timeout)
        except asyncio.TimeoutError:
            raise Exception("请求超时")

class OllamaHandler(LLMHandler):
    """本地Ollama模型处理器"""
    def __init__(self):
        self.api_endpoint = os.getenv("OLLAMA_API_ENDPOINT")
        self.model = os.getenv("OLLAMA_MODEL", "phi4")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate_description(self, image_data: Optional[str], prompt: str) -> str:
        async def _generate():
            headers = {"Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }

            if image_data:
                payload["image"] = image_data

            try:
                response = requests.post(
                    self.api_endpoint,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                return response.json().get("response", "")
            except Exception as e:
                raise Exception(f"Ollama API错误: {str(e)}")
        
        return await self._handle_timeout(_generate())

class OpenAIHandler(LLMHandler):
    """OpenAI API处理器"""
    def __init__(self):
        openai.api_base = os.getenv("OPENAI_API_ENDPOINT")
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.model = "gpt-4-vision-preview"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate_description(self, image_data: Optional[str], prompt: str) -> str:
        async def _generate():
            try:
                messages = []
                if image_data:
                    messages.append({
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    })
                else:
                    messages.append({
                        "role": "user",
                        "content": prompt
                    })

                response = await openai.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=300
                )
                return response.choices[0].message.content
            except Exception as e:
                raise Exception(f"OpenAI API错误: {str(e)}")
        
        return await self._handle_timeout(_generate())

class GeminiHandler(LLMHandler):
    """Google Gemini API处理器"""
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        api_endpoint = os.getenv("GEMINI_API_ENDPOINT")
        if not api_key:
            raise ValueError("未找到GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')
        self.text_model = genai.GenerativeModel('gemini-pro')

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate_description(self, image_data: Optional[str], prompt: str) -> str:
        async def _generate():
            try:
                if image_data:
                    # 处理图片输入
                    image_bytes = base64.b64decode(image_data)
                    image = Image.open(io.BytesIO(image_bytes))
                    response = self.vision_model.generate_content([prompt, image])
                else:
                    # 处理纯文本输入
                    response = self.text_model.generate_content(prompt)

                if response.prompt_feedback.block_reason:
                    raise Exception(f"内容被阻止: {response.prompt_feedback.block_reason}")

                return response.text
            except Exception as e:
                raise Exception(f"Gemini API错误: {str(e)}")
        
        return await self._handle_timeout(_generate())

class LLMFactory:
    """LLM处理器工厂类"""
    _handlers = {
        'olama': OllamaHandler,
        'openai': OpenAIHandler,
        'gemini': GeminiHandler
    }

    @classmethod
    def get_handler(cls, model_type: str) -> LLMHandler:
        """
        获取指定类型的LLM处理器实例
        
        Args:
            model_type: 模型类型 ('olama', 'openai', 'gemini')
            
        Returns:
            LLMHandler: 对应的模型处理器实例
            
        Raises:
            ValueError: 如果指定了不支持的模型类型
        """
        handler_class = cls._handlers.get(model_type.lower())
        if not handler_class:
            supported_models = ", ".join(cls._handlers.keys())
            raise ValueError(
                f"不支持的模型类型: {model_type}。支持的模型类型有: {supported_models}"
            )
        
        return handler_class()

# 使用示例
if __name__ == "__main__":
    
    async def test():
        # 测试纯文本生成
        handler = LLMFactory.get_handler('olama')
        description = await handler.generate_description(
            None, 
            "描述一个美丽的春天场景"
        )
        print(f"生成的描述: {description}")
    
    asyncio.run(test())