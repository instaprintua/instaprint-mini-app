import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Download, RefreshCw, AlertCircle, Shirt, Coffee, Square, Key, Ruler, X, Send, ShoppingCart } from 'lucide-react';

// API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Фірмові кольори
const BRAND = {
  red: '#e31b23',
  yellow: '#fde015',
  blue: '#0071bc',
  green: '#00a651'
};

const PRODUCTS = {
  mug: {
    id: 'mug',
    name: 'Чашка',
    icon: Coffee,
    themeColor: BRAND.red,
    getPrompt: () => "A professional photorealistic mockup showing two ceramic coffee mugs placed together. The design features a colorful custom logo. Vibrant colors, studio lighting, professional product photography."
  },
  tshirt: {
    id: 'tshirt',
    name: 'Футболка',
    icon: Shirt,
    themeColor: BRAND.yellow,
    getPrompt: (color) => `A photorealistic mockup of a high-quality ${color === 'black' ? 'black' : 'white'} t-shirt. Directly printed on the center chest area is a bright custom graphic. Show natural fabric folds and shadows over the print. Studio lighting, modern fashion look.`
  },
  pillow: {
    id: 'pillow',
    name: 'Подушка',
    icon: Square,
    themeColor: BRAND.blue,
    getPrompt: () => "A photorealistic mockup of a 35x35 cm square plush fuzzy throw pillow with a custom graphic printed in the center. Soft plush/fleece texture, cozy interior lighting."
  },
  keychain: {
    id: 'keychain',
    name: 'Брелок',
    icon: Key,
    themeColor: BRAND.green,
    getPrompt: () => "A photorealistic macro close-up of a premium metal keychain resting on a wooden table with a custom graphic printed on it. High detail, shallow depth of field, professional photography."
  }
};

export default function App() {
  const [activeProduct, setActiveProduct] = useState('tshirt');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedMimeType, setUploadedMimeType] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedGender, setSelectedGender] = useState('unisex');
  const [tshirtColor, setTshirtColor] = useState('white');
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
      }
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const fileInputRef = useRef(null);
  const product = PRODUCTS[activeProduct];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setGeneratedResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const generateVisualization = async () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setError(null);

    // Підключаємо графічну модель Imagen 3 (версія 001 для Google AI Studio)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
    const promptText = product.getPrompt(tshirtColor);
    
    const payload = {
      instances: [
        { prompt: promptText }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1"
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Помилка сервера: ${response.status}`);
      }

      const result = await response.json();
      const prediction = result.predictions?.[0];

      if (prediction && prediction.bytesBase64Encoded) {
        const finalImageUrl = `data:${prediction.mimeType || 'image/jpeg'};base64,${prediction.bytesBase64Encoded}`;
        setGeneratedResult(finalImageUrl);
      } else {
        throw new Error("ШІ не зміг згенерувати зображення. Будь ласка, спробуйте ще раз.");
      }
    } catch (err) {
      setError(err.message || "Сталася невідома помилка при генерації.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTelegramOrder = () => {
    let orderInfo = `✨ Нове замовлення з InstaprintAI\n\n`;
    orderInfo += `📦 Товар: ${product.name}\n`;
    if (activeProduct === 'tshirt') {
      const genderStr = selectedGender === 'lady' ? 'Жіноча' : selectedGender === 'kids' ? 'Дитяча' : 'Унісекс';
      const colorStr = tshirtColor === 'white' ? 'Біла' : 'Чорна';
      orderInfo += `👗 Тип: ${genderStr}\n`;
      orderInfo += `📏 Розмір: ${selectedSize}\n`;
      orderInfo += `🎨 Колір: ${colorStr}\n`;
    }
    orderInfo += `\n(Прикріпіть завантажений макет до цього повідомлення)`;
    const telegramUrl = `https://t.me/instaprint?text=${encodeURIComponent(orderInfo)}`;
    window.open(telegramUrl, '_blank');
  };

  const getFileExtension = () => {
    if (!uploadedMimeType) return 'png';
    return uploadedMimeType.split('/')[1] || 'png';
  };

  const Logo = () => (
    <div className="flex flex-col items-center select-none">
      <div className="font-black text-3xl tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
        Instaprint<span className="font-serif italic font-normal text-gray-800">AI</span>
      </div>
      <div className="flex w-full h-1 mt-1 mb-1 rounded-full overflow-hidden">
        <div className="flex-1" style={{ backgroundColor: BRAND.red }}></div>
        <div className="flex-1" style={{ backgroundColor: BRAND.yellow }}></div>
        <div className="flex-1" style={{ backgroundColor: BRAND.blue }}></div>
        <div className="flex-1" style={{ backgroundColor: BRAND.green }}></div>
      </div>
      <div className="text-[9px] font-bold tracking-[0.3em] text-gray-500 uppercase">
        Smart Visualizer
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b shadow-sm z-30 sticky top-0 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto relative flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex flex-1">
            <div className="text-sm font-medium text-gray-500 flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
              <Wand2 size={16} className="text-purple-500 shrink-0" />
              <span className="hidden lg:inline">Генерація мокапів за допомогою ШІ</span>
              <span className="lg:hidden">ШІ Візуалізатор</span>
            </div>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end items-center gap-4 w-full">
            <Logo />
            <div className="flex shrink-0">
              <a href="https://instaprintua.com/ua/g84202963-pid-zamovlennya" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 z-50 bg-[#0071bc] hover:bg-[#005a96] group">
                <ShoppingCart size={20} className="shrink-0 group-hover:animate-bounce" />
                <span className="text-sm sm:text-base font-bold text-center leading-tight">Каталог товарів<br className="sm:hidden" /> для друку</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col items-center">
        {!generatedResult && !isGenerating && (
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-center">1. Оберіть продукт</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(PRODUCTS).map(p => (
                  <button key={p.id} onClick={() => { setActiveProduct(p.id); setGeneratedResult(null); }} className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border-2 ${activeProduct === p.id ? 'bg-gray-50 shadow-md' : 'border-transparent text-gray-500 hover:bg-gray-50'}`} style={{ borderColor: activeProduct === p.id ? p.themeColor : 'transparent' }}>
                    <p.icon size={32} style={{ color: activeProduct === p.id ? p.themeColor : '#9ca3af' }} />
                    <span className={`font-medium ${activeProduct === p.id ? 'text-gray-900' : ''}`}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeProduct === 'tshirt' && (
              <div className="px-6 sm:px-8 py-5 border-b border-gray-100 bg-yellow-50/30 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto justify-center">
                    <span className="font-medium text-gray-700 text-sm">Колір:</span>
                    <div className="flex gap-2">
                      <button onClick={() => setTshirtColor('white')} className={`w-8 h-8 rounded-full border-2 transition-all ${tshirtColor === 'white' ? 'border-yellow-400 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-300'}`} style={{ backgroundColor: '#ffffff' }} />
                      <button onClick={() => setTshirtColor('black')} className={`w-8 h-8 rounded-full border-2 transition-all ${tshirtColor === 'black' ? 'border-yellow-400 scale-110 shadow-md' : 'border-gray-700 hover:border-gray-900'}`} style={{ backgroundColor: '#111827' }} />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm w-full sm:w-auto cursor-pointer">
                      <option value="unisex">Унісекс (Чоловіча)</option>
                      <option value="lady">Жіноча (Lady-Fit)</option>
                      <option value="kids">Дитяча</option>
                    </select>
                    <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm w-full sm:w-auto cursor-pointer">
                      {selectedGender === 'kids' ? (
                        <>
                          <option value="3-4">3-4 роки (104)</option>
                          <option value="5-6">5-6 років (116)</option>
                          <option value="7-8">7-8 років (128)</option>
                          <option value="9-11">9-11 років (140)</option>
                          <option value="12-13">12-13 років (152)</option>
                          <option value="14-15">14-15 років (164)</option>
                        </>
                      ) : (
                        <>
                          {selectedGender === 'lady' && <option value="XS">XS</option>}
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <button onClick={() => setIsSizeModalOpen(true)} className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-semibold text-sm bg-yellow-300 hover:bg-yellow-400 px-5 py-2.5 rounded-xl transition-colors shadow-sm w-full lg:w-auto justify-center shrink-0">
                  <Ruler size={18} /> Розмірна сітка
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8 flex flex-col items-center bg-gray-50/50">
              <h2 className="text-xl font-bold mb-6 text-center">2. Завантажте принт та генеруйте</h2>
              <div className="flex flex-col sm:flex-row gap-8 w-full items-center justify-center">
                <div onClick={() => fileInputRef.current?.click()} className={`w-56 h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${uploadedImage ? 'border-transparent shadow-xl bg-white' : 'border-gray-300 hover:border-gray-400 bg-white'}`} style={{ borderColor: uploadedImage ? product.themeColor : undefined }}>
                  {uploadedImage ? (
                    <>
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain p-3" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium backdrop-blur-sm">Змінити макет</div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Upload size={32} className="text-gray-500" /></div>
                      <span className="text-sm font-medium text-gray-600 text-center px-4">Завантажте макет<br/>(JPEG, PNG)</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 w-full sm:w-auto flex flex-col justify-center gap-3 max-w-sm">
                  <button onClick={generateVisualization} disabled={!uploadedImage} className={`w-full px-8 py-5 rounded-2xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all ${!uploadedImage ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'hover:scale-105 active:scale-95'}`} style={{ backgroundColor: uploadedImage ? product.themeColor : undefined }}>
                    <Wand2 size={24} /> Візуалізувати в ШІ
                  </button>
                  <p className="text-xs text-gray-500 text-center flex flex-col gap-1.5 mt-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="font-medium text-gray-700">⚡ Як це працює:</span>
                    {activeProduct === 'pillow' && <span>Буде створено плюшеву подушку з білою рамкою.</span>}
                    {activeProduct === 'mug' && <span>Буде згенеровано композицію з різних сторін чашки.</span>}
                    {activeProduct === 'tshirt' && <span>Принт буде накладено на {tshirtColor === 'white' ? 'білу' : 'чорну'} футболку зі складками.</span>}
                    {activeProduct === 'keychain' && <span>Принт буде ідеально вписано в форму брелка.</span>}
                  </p>
                </div>
              </div>
              {error && (
                <div className="mt-6 w-full max-w-2xl bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 w-full max-w-2xl animate-in fade-in duration-500">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${product.themeColor} transparent transparent transparent` }}></div>
              <div className="absolute inset-0 flex items-center justify-center"><Wand2 size={32} style={{ color: product.themeColor }} className="animate-pulse" /></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">Штучний інтелект створює магію...</h2>
          </div>
        )}

        {generatedResult && !isGenerating && (
          <div className="w-full max-w-5xl flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ваш результат</h2>
                <p className="text-gray-500">Ось як виглядатиме готова продукція</p>
              </div>
              <button onClick={() => setGeneratedResult(null)} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border shadow-sm transition-colors">
                <RefreshCw size={16} /> Почати заново
              </button>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-2xl border border-gray-100 w-full relative overflow-hidden group">
              <img src={generatedResult} alt="AI Generated Mockup" className="w-full h-auto max-h-[70vh] object-contain rounded-2xl bg-gray-100" />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handleTelegramOrder} className="px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105" style={{ backgroundColor: product.themeColor }}>
                Утвердити та замовити <Send size={24} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
