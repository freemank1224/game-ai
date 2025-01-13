import { useState, useEffect } from 'react'
import './App.css'
import { presetObjects } from './config/objects'

function App() {
  const [response, setResponse] = useState(null)
  const [modelType, setModelType] = useState('ollama')
  const [description, setDescription] = useState('')
  const [selectedObject, setSelectedObject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imagePositions, setImagePositions] = useState(['real', 'ai'])
  const [userGuess, setUserGuess] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [realImage, setRealImage] = useState(null)  // 新增状态存储真实图片
  const [aiImage, setAiImage] = useState(null)      // 新增状态存储AI图片
  const [isGeneratingImage, setIsGeneratingImage] = useState(false) // 添加加载状态
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false) // 新增：生成提示词状态
  const [gameHistory, setGameHistory] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  const resetGameState = () => {
    setDescription('')
    setAiImage(null)
    setShowResult(false)
    setUserGuess(null)
    setIsGeneratingImage(false)
    setIsGeneratingPrompt(false)
    setRealImage(null)  // 重置真实图片
    setGameHistory([])  // 重置游戏历史
    setTotalScore(0)    // 重置总分
  }

  const handleObjectSelect = async (event) => {
    const selected = event.target.value
    setSelectedObject(selected)
    
    const selectedObjData = presetObjects.find(obj => obj.id === selected)
    if (!selectedObjData) return

    // 重置游戏状态
    resetGameState()

    // 设置新的真实图片
    setRealImage(selectedObjData.image)
    
    // 开始生成新的提示词
    await generatePrompt(selectedObjData)
  }

  const generatePrompt = async (objData) => {
    setIsGeneratingPrompt(true)  // 开始生成提示词
    try {
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/analyze-image`
        console.log('Debug - API URL:', apiUrl)
        
        const formData = new FormData()
        formData.append('objectName', objData.name)
        formData.append('image_url', objData.image)
        formData.append('model_type', modelType)

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        })
        
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
        setIsGeneratingPrompt(false)
    }
  }

  // 监听模型类型变化，重新生成提示词
  useEffect(() => {
    if (selectedObject) {
      const objData = presetObjects.find(obj => obj.id === selectedObject)
      if (objData) {
        resetGameState()
        generatePrompt(objData)
      }
    }
  }, [modelType])

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
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/generate-image`
      const formData = new FormData()
      formData.append('prompt', description)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      if (result.code === 200) {
        setAiImage(result.data.image_url)
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
    
    const isCorrect = guess === 'ai';
    const newHistory = [...gameHistory, {
      round: gameHistory.length + 1,
      guess,
      isCorrect
    }];
    
    setGameHistory(newHistory);
    setTotalScore(newHistory.filter(h => h.isCorrect).length);
    
    // 如果已经玩了5轮，显示结果并重置游戏
    if (newHistory.length >= 5) {
      setTimeout(() => {
        alert(`游戏结束！最终得分：${newHistory.filter(h => h.isCorrect).length}分`);
        setGameHistory([]);  // 重置游戏历史
        setTotalScore(0);    // 重置总分
        setSelectedObject('')  // 重置选择的对象
        resetGameState(); // 游戏结束后重置所有状态
      }, 500);
    }
  }

  return (
    <div className="app-container">
      <h1>AI HUNTER</h1>
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
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          
          <textarea 
            value={description} 
            readOnly 
            className="description-box" 
            placeholder={isGeneratingPrompt ? "AI正在识别图像，生成提示词..." : "这里将显示生成的描述词..."}
          />
          
          <button 
            onClick={handleGenerateImage} 
            className="generate-button"
            disabled={!description || isGeneratingPrompt}
          >
            {isGeneratingPrompt ? "正在生成提示词..." : "生成AI图像"}
          </button>

          {/* 简化的游戏记录容器 */}
          <div style={{
            marginTop: '2.5rem',
            padding: '2rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(188, 175, 155, 0.15)', // 温暖的米褐色
            border: '1px solid rgba(171, 155, 132, 0.3)', // 浅棕色边框
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          }}>
            <h3 style={{
              margin: '0 0 1.8rem 0',
              color: 'rgba(108, 92, 69, 0.95)', // 暖棕色文字
              fontSize: '1.25rem',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>游戏记录 (5轮)</h3>
            
            {gameHistory.map((record, index) => (
              <div 
                key={index}
                style={{
                  marginBottom: '1rem',
                  padding: '1rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(188, 175, 155, 0.1)', // 更浅的米色
                  color: 'rgba(171, 155, 132, 0.95)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: record.isCorrect ? 
                    '3px solid rgba(156, 180, 130, 0.8)' : // 正确时的边框色
                    '3px solid rgba(164, 128, 115, 0.8)', // 错误时的边框色
                }}
              >
                <span>第 {record.round} 轮</span>
                <span>{record.isCorrect ? '✓ 答对了！' : '✗ 答错了'}</span>
              </div>
            ))}
            
            {gameHistory.length > 0 ? (
              <div style={{
                marginTop: '1.5rem',
                color: 'rgba(171, 155, 132, 0.95)',
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: '500'
              }}>
                当前得分：{totalScore} / {gameHistory.length}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'rgba(171, 155, 132, 0.7)',
                padding: '1rem'
              }}>
                还没有游戏记录
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => {
                  setSelectedObject('')  // 重置选择的对象
                  resetGameState()
                }} 
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#fff',
                  backgroundColor: '#f44336', // 红色背景
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                重置游戏
              </button>
            </div>
          </div>
        </div>
        
        <div className="right-panel">
          <h2 className="guess-prompt">
            {isGeneratingImage || isGeneratingPrompt ? "大语言模型正在推理，请等待..." : 
             aiImage ? "请猜测哪个是AI生成的图片？" : "请选择对象并生成AI图像"}
          </h2>
          <div className="images-container">
            {(isGeneratingImage || aiImage || isGeneratingPrompt) ? (
              imagePositions.map((type, index) => (
                <div key={type} className="image-guess-container">
                  {isGeneratingImage || isGeneratingPrompt ? (
                    <div className="loading-placeholder" />
                  ) : (
                    <>
                      <img
                        src={type === 'real' ? realImage : aiImage}
                        alt={type}
                        className={`image ${
                          showResult && userGuess === type 
                            ? `selected-image ${type === 'ai' ? 'correct' : 'incorrect'}`
                            : ''
                        }`}
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
