import React, { useState } from 'react';
import './App.css';

function App() {
    const [response, setResponse] = useState(null);
    const [modelType, setModelType] = useState('olama');
    const [description, setDescription] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const input = document.getElementById('image-input');
        if (input.files.length === 0) {
            alert('请选择一张图片');
            setIsLoading(false);
            return;
        }

        const file = input.files[0];
        setUploadedImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(process.env.REACT_APP_API_ENDPOINT, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            setDescription(result.description);
            setResponse(result);
        } catch (error) {
            console.error('Error:', error);
            setResponse('请求失败，请重试。');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        let apiEndpoint, apiKey;
        if (modelType === 'olama') {
            apiEndpoint = process.env.REACT_APP_OLAMA_API_ENDPOINT;
            apiKey = process.env.REACT_APP_OLAMA_API_KEY;
        } else if (modelType === 'openai') {
            apiEndpoint = process.env.REACT_APP_OPENAI_API_ENDPOINT;
            apiKey = process.env.REACT_APP_OPENAI_API_KEY;
        } else if (modelType === 'gemini') {
            apiEndpoint = process.env.REACT_APP_GEMINI_API_ENDPOINT;
            apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        } else {
            throw new Error('未知的模型类型');
        }

        try {
            const imageRes = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ description })
            });
            const imageResult = await imageRes.json();
            setResponse(imageResult);
        } catch (error) {
            console.error('Error:', error);
            setResponse('请求失败，请重试。');
        }
    };

    return (
        <div className="app-container">
            <h1>互动游戏</h1>
            <div className="content-wrapper">
                <div className="left-panel">
                    <form onSubmit={handleImageUpload} className="form-container">
                        <input type="file" id="image-input" accept="image/*" className="file-input" />
                        <button type="submit" className="submit-button">上传图片</button>
                    </form>
                    <div className="model-selection">
                        <label htmlFor="model-select">选择大语言模型:</label>
                        <select id="model-select" value={modelType} onChange={(e) => setModelType(e.target.value)}>
                            <option value="olama">Olama</option>
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Google Gemini</option>
                        </select>
                    </div>
                    <button onClick={handleGenerateImage} className="generate-button">生成描述词</button>
                    <textarea value={description} readOnly className="description-box" />
                </div>
                <div className="right-panel">
                    <div className="image-container">
                        <h2>上传的图片</h2>
                        {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="image" />}
                    </div>
                    <div className="image-container">
                        <h2>生成的图片</h2>
                        {response && response.image && <img src={response.image} alt="Generated" className="image" />}
                    </div>
                </div>
            </div>
            {isLoading && <div className="loading">处理中...</div>}
        </div>
    );
}

export default App;
