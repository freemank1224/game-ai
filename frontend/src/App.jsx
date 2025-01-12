import { useState, useEffect } from 'react'
import './App.css'
import { presetObjects } from './config/objects'

function App() {
  const [response, setResponse] = useState(null)
  const [modelType, setModelType] = useState('olama')
  const [description, setDescription] = useState('')
  const [selectedObject, setSelectedObject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imagePositions, setImagePositions] = useState(['real', 'ai'])
  const [userGuess, setUserGuess] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [realImage, setRealImage] = useState(null)  // 新增状态存储真实图片
  const [aiImage, setAiImage] = useState(null)      // 新增状态存储AI图片
  const [isGeneratingImage, setIsGeneratingImage] = useState(false) // 添加加载状态

  const handleObjectSelect = async (event) => {
    const selected = event.target.value
    setSelectedObject(selected)
    
    const selectedObjData = presetObjects.find(obj => obj.id === selected)
    if (!selectedObjData) return

    // 只在内部保存真实图片，不立即显示
    setRealImage(selectedObjData.image)
    setIsLoading(true)
    try {
      // 调用后端生成描述词
      const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objectName: selectedObjData.name })
      })
      const result = await res.json()
      setDescription(result.prompt)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    const input = document.getElementById('image-input')
    if (input.files.length === 0) {
      alert('请选择一张图片')
      setIsLoading(false)
      return
    }

    const file = input.files[0]
    setUploadedImage(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(import.meta.env.VITE_API_ENDPOINT, {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      setDescription(result.description)
      setResponse(result)
    } catch (error) {
      console.error('Error:', error)
      setResponse('请求失败，请重试。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true) // 开始生成时设置状态
    let apiEndpoint
    if (modelType === 'olama') {
      apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/generate-prompt`
    } else if (modelType === 'openai') {
      apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/generate-prompt`
    } else if (modelType === 'gemini') {
      apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/generate-prompt`
    }

    try {
      const formData = new FormData()
      formData.append('objectName', selectedObject)
      formData.append('model_type', modelType)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      setAiImage(result.data.image)  // 保存AI生成的图片
      
      // 生成随机位置并开始游戏
      setImagePositions(shuffle(['real', 'ai']))
      setShowResult(false)
      setUserGuess(null)
    } catch (error) {
      console.error('Error:', error)
      setAiImage(null)
    } finally {
      setIsGeneratingImage(false) // 生成完成后重置状态
    }
  }

  // 每次生成新图片时随机排列位置
  useEffect(() => {
    if (response && response.image) {
      setImagePositions(shuffle(['real', 'ai']))
      setShowResult(false)
      setUserGuess(null)
    }
  }, [response])

  // Fisher-Yates 洗牌算法
  const shuffle = (array) => {
    let currentIndex = array.length
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
  }

  const handleGuess = (guess) => {
    setUserGuess(guess)
    setShowResult(true)
  }

  return (
    <div className="app-container">
      <h1>AI图像互动游戏</h1>
      <div className="content-wrapper">
        <div className="left-panel">
          <div className="object-selection">
            <label htmlFor="object-select">选择对象:</label>
            <select 
              id="object-select" 
              value={selectedObject}
              onChange={handleObjectSelect}
              className="object-select"
            >
              <option value="">请选择一个对象</option>
              {presetObjects.map(obj => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="model-selection">
            <label htmlFor="model-select">选择大语言模型:</label>
            <select 
              id="model-select" 
              value={modelType} 
              onChange={(e) => setModelType(e.target.value)}
              className="model-select"
            >
              <option value="olama">Olama</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          
          <textarea 
            value={description} 
            readOnly 
            className="description-box" 
            placeholder="这里将显示生成的描述词..."
          />
          
          <button 
            onClick={handleGenerateImage} 
            className="generate-button"
            disabled={!description}
          >
            生成AI图像
          </button>
        </div>
        
        <div className="right-panel">
          <h2 className="guess-prompt">
            {isGeneratingImage ? "正在生成图像..." : 
             aiImage ? "请猜测哪个是AI生成的图片？" : "请选择对象并生成AI图像"}
          </h2>
          <div className="images-container">
            {(isGeneratingImage || aiImage) ? (
              imagePositions.map((type, index) => (
                <div key={type} className="image-guess-container">
                  {isGeneratingImage ? (
                    <div className="loading-placeholder" />
                  ) : (
                    <>
                      <img
                        src={type === 'real' ? realImage : aiImage}
                        alt={type}
                        className={`image ${showResult && userGuess === type ? 'selected' : ''}`}
                        onClick={() => !showResult && handleGuess(type)}
                      />
                      <button 
                        className={`guess-button ${showResult && userGuess === type ? 'selected' : ''}`}
                        onClick={() => !showResult && handleGuess(type)}
                        disabled={showResult}
                      >
                        选择这个
                      </button>
                      {showResult && (
                        <div className={`result-badge ${type === userGuess ? (type === 'ai' ? 'correct' : 'incorrect') : ''}`}>
                          {type === 'real' ? '真实图片' : 'AI生成'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="image-guess-container">
                  <div className="initial-placeholder" />
                </div>
                <div className="image-guess-container">
                  <div className="initial-placeholder" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {isLoading && <div className="loading">处理中...</div>}
    </div>
  )
}

export default App
