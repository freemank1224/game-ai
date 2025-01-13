import os
import json
import asyncio
import aiohttp
from typing import Dict, Any

class ComfyUIHandler:
    def __init__(self):
        self.base_url = os.getenv("COMFY_UI_ENDPOINT", "http://localhost:8188")
        self.queue_endpoint = f"{self.base_url}/queue"
        self.history_endpoint = f"{self.base_url}/history"
        
        # 加载工作流配置
        workflow_path = os.path.join(os.path.dirname(__file__), "..", "workflows", "BasicImGen.json")
        with open(workflow_path, 'r') as f:
            self.workflow = json.load(f)

    def _prepare_workflow(self, prompt: str) -> Dict[str, Any]:
        """准备工作流数据，更新提示词"""
        workflow = self.workflow.copy()
        # 更新正面提示词节点
        workflow["6"]["inputs"]["text"] = f"{prompt}, photorealistic, masterpiece, best quality"
        # 更新负面提示词节点
        workflow["7"]["inputs"]["text"] = "text, watermark, bad quality, blur, noise"
        return workflow

    async def _check_queue_status(self, session: aiohttp.ClientSession) -> bool:
        """检查队列状态"""
        try:
            async with session.get(self.queue_endpoint) as response:
                if response.status == 200:
                    queue_data = await response.json()
                    return len(queue_data['queue_running']) == 0
                return False
        except Exception as e:
            print(f"检查队列状态失败: {str(e)}")
            return False

    async def generate_image(self, prompt: str) -> str:
        """生成图片"""
        try:
            # 准备工作流数据
            workflow_data = self._prepare_workflow(prompt)
            
            async with aiohttp.ClientSession() as session:
                # 1. 等待队列可用
                retries = 0
                while retries < 30:  # 最多等待30秒
                    if await self._check_queue_status(session):
                        break
                    await asyncio.sleep(1)
                    retries += 1
                
                # 2. 提交工作流
                try:
                    # 修改请求格式
                    request_data = {
                        "prompt": workflow_data,  # 工作流数据
                        "client_id": "backend_api"  # 添加客户端ID
                    }
                    
                    print(f"Debug - Submitting workflow: {json.dumps(request_data, indent=2)}")
                    
                    async with session.post(
                        f"{self.base_url}/prompt",
                        json=request_data,  # 使用包装后的请求数据
                        headers={
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    ) as response:
                        response_text = await response.text()
                        print(f"Debug - ComfyUI Response: {response_text}")
                        
                        if response.status != 200:
                            raise Exception(f"提交工作流失败 (状态码: {response.status}): {response_text}")
                            
                        try:
                            prompt_response = json.loads(response_text)
                            prompt_id = prompt_response.get('prompt_id')
                            if not prompt_id:
                                raise Exception("未获取到prompt_id")
                            print(f"Debug - Got prompt_id: {prompt_id}")
                        except json.JSONDecodeError:
                            raise Exception(f"解析响应失败: {response_text}")
                            
                except Exception as e:
                    print(f"Debug - Workflow submission error: {str(e)}")
                    raise Exception(f"提交工作流失败: {str(e)}")

                # 3. 等待生成完成
                max_retries = 300  # 最多等待60秒
                retries = 0
                while retries < max_retries:
                    try:
                        async with session.get(self.history_endpoint) as response:
                            if response.status == 200:
                                history = await response.json()
                                if prompt_id in history:
                                    outputs = history[prompt_id].get('outputs', {})
                                    for node_id, node_output in outputs.items():
                                        if isinstance(node_output, dict) and node_output.get('images'):
                                            image_name = node_output['images'][0]['filename']
                                            return f"{self.base_url}/view?filename={image_name}"
                    except Exception as e:
                        print(f"检查历史记录失败: {str(e)}")
                    
                    await asyncio.sleep(1)
                    retries += 1

                raise Exception("生成超时")

        except Exception as e:
            raise Exception(f"图片生成失败: {str(e)}")
