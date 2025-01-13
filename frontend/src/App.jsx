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

    setRealImage(selectedObjData.image)
    setIsLoading(true)
    try {
        // 修改请求URL和格式
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/generate-prompt`
        console.log('Debug - API URL:', apiUrl)
        
        const formData = new FormData()
        formData.append('objectName', selectedObjData.name)
        formData.append('image_url', selectedObjData.image)

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        })
        
        console.log('Debug - Response:', response.status)
        const result = await response.json()
        console.log('Debug - Result:', result)
        
        if (result.code === 200) {
            setDescription(result.data.prompt)
        } else {
            throw new Error(result.message || '请求失败')
        }
    } catch (error) {
        console.error('Debug - Error:', error)
        setDescription('生成描述失败，请重试')
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
    setIsGeneratingImage(true)
    try {
      const formData = new FormData()
      formData.append('objectName', selectedObject)
      formData.append('image_url', realImage)  // 添加真实图片URL

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate-prompt`, {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      if (result.code === 200) {
        setAiImage(result.data.image)
        setDescription(result.data.prompt)
        setImagePositions(shuffle(['real', 'ai']))
        setShowResult(false)
        setUserGuess(null)
      } else {
        throw new Error(result.message || '生成失败')
      }
    } catch (error) {
      console.error('Error:', error)
      setAiImage(null)
    } finally {
      setIsGeneratingImage(false)
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
