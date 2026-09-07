import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, RefreshCw, Shirt, Coffee, Square, Key, Ruler, X, Send, ShoppingCart } from 'lucide-react';

// Фірмові кольори
const BRAND = {
  red: '#e31b23',
  yellow: '#fde015',
  blue: '#0071bc',
  green: '#00a651'
};

const PRODUCTS = {
  mug: { id: 'mug', name: 'Чашка', icon: Coffee, themeColor: BRAND.red },
  tshirt: { id: 'tshirt', name: 'Футболка', icon: Shirt, themeColor: BRAND.yellow },
  pillow: { id: 'pillow', name: 'Подушка', icon: Square, themeColor: BRAND.blue },
  keychain: { id: 'keychain', name: 'Брелок', icon: Key, themeColor: BRAND.green }
};

export default function App() {
  const [activeProduct, setActiveProduct] = useState('tshirt');
  const [uploadedImage, setUploadedImage] = useState(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(false);

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
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }
    };
    document.head.appendChild(script);
  }, []);

  const fileInputRef = useRef(null);
  const product = PRODUCTS[activeProduct];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setGeneratedResult(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const generateVisualization = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    
    // Імітація роботи алгоритму для wow-ефекту перед клієнтом
    setTimeout(() => {
      setGeneratedResult(true);
      setIsGenerating(false);
    }, 1500);
  };

  const handleTelegramOrder = () => {
    let orderInfo = `✨ Нове замовлення з Instaprint\n\n`;
    orderInfo += `📦 Товар: ${product.name}\n`;
    if (activeProduct === 'tshirt') {
      const genderStr = selectedGender === 'lady' ? 'Жіноча' : selectedGender === 'kids' ? 'Дитяча' : 'Унісекс';
      const colorStr = tshirtColor === 'white' ? 'Біла' : 'Чорна';
      orderInfo += `👗 Тип: ${genderStr}\n`;
      orderInfo += `📏 Розмір: ${selectedSize}\n`;
      orderInfo += `🎨 Колір: ${colorStr}\n`;
    }
    orderInfo += `\n(Клієнт має прикріпити своє фото до цього повідомлення!)`;
    const telegramUrl = `https://t.me/instaprint?text=${encodeURIComponent(orderInfo)}`;
    window.open(telegramUrl, '_blank');
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
        Smart Preview
      </div>
    </div>
  );

  // Динамічний рендер макету за допомогою CSS
  const renderMockup = () => {
    let containerStyle = "relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-inner border-2 border-gray-100 ";
    let imageStyle = "relative z-10 object-contain drop-shadow-md transition-all ";
    
    if (activeProduct === 'tshirt') {
      containerStyle += tshirtColor === 'white' ? "bg-[#f5f5f5]" : "bg-[#1a1a1a]";
      imageStyle += "w-2/5 -mt-12 mix-blend-multiply"; 
      if (tshirtColor === 'black') imageStyle = imageStyle.replace('mix-blend-multiply', 'opacity-90');
    } else if (activeProduct === 'mug') {
      containerStyle += "bg-gradient-to-b from-gray-50 to-gray-200";
      imageStyle += "w-1/2 h-1/2 object-cover rounded-xl shadow-sm";
    } else if (activeProduct === 'pillow') {
      containerStyle += "bg-white p-12";
      imageStyle += "w-full h-full object-cover rounded-md shadow-inner";
    } else if (activeProduct === 'keychain') {
      containerStyle += "bg-amber-50";
      imageStyle += "w-1/3 h-1/3 object-cover rounded-full shadow-lg border-4 border-gray-300";
    }

    return (
      <div className={containerStyle}>
        {/* Імітація об'єму (блік) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/30 pointer-events-none z-20"></div>
        {activeProduct === 'tshirt' && (
          <div className="absolute top-4 text-xs font-bold text-gray-400 opacity-50 z-0 border-b-2 px-8 pb-1">Комір</div>
        )}
        <img src={uploadedImage} alt="Print Preview" className={imageStyle} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b shadow-sm z-30 sticky top-0 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto relative flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex flex-1">
            <div className="text-sm font-medium text-gray-500 flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
              <Wand2 size={16} className="text-purple-500 shrink-0" />
              <span className="hidden lg:inline">Візуалізація макетів</span>
              <span className="lg:hidden">Прев'ю</span>
            </div>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end items-center gap-4 w-full">
            <Logo />
            <div className="flex shrink-0">
              <a href="https://instaprintua.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:translate-y-0 z-50 bg-[#0071bc] hover:bg-[#005a96] group">
                <ShoppingCart size={20} className="shrink-0" />
                <span className="text-sm sm:text-base font-bold text-center leading-tight">Каталог<br className="sm:hidden" /> товарів</span>
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
                  <button key={p.id} onClick={() => { setActiveProduct(p.id); setGeneratedResult(false); }} className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border-2 ${activeProduct === p.id ? 'bg-gray-50 shadow-md' : 'border-transparent text-gray-500 hover:bg-gray-50'}`} style={{ borderColor: activeProduct === p.id ? p.themeColor : 'transparent' }}>
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
                      <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setIsSizeModalOpen(true)} className="flex items-center gap-2 text-yellow-700 font-semibold text-sm bg-yellow-300 px-5 py-2.5 rounded-xl">
                  <Ruler size={18} /> Розмірна сітка
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8 flex flex-col items-center bg-gray-50/50">
              <h2 className="text-xl font-bold mb-6 text-center">2. Завантажте принт та генеруйте</h2>
              <div className="flex flex-col sm:flex-row gap-8 w-full items-center justify-center">
                <div onClick={() => fileInputRef.current?.click()} className={`w-56 h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${uploadedImage ? 'border-transparent shadow-xl bg-white' : 'border-gray-300 bg-white'}`} style={{ borderColor: uploadedImage ? product.themeColor : undefined }}>
                  {uploadedImage ? (
                    <>
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain p-3" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">Змінити макет</div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3"><Upload size={32} className="text-gray-500" /></div>
                      <span className="text-sm font-medium text-gray-600 text-center px-4">Завантажте макет<br/>(JPEG, PNG)</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 w-full sm:w-auto flex flex-col justify-center gap-3 max-w-sm">
                  <button onClick={generateVisualization} disabled={!uploadedImage} className={`w-full px-8 py-5 rounded-2xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all ${!uploadedImage ? 'bg-gray-300 cursor-not-allowed' : 'hover:scale-105'}`} style={{ backgroundColor: uploadedImage ? product.themeColor : undefined }}>
                    <Wand2 size={24} /> Попередній перегляд
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2 bg-white p-3 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">⚡ Увага:</span> Це лише приблизна візуалізація для загального розуміння. Точне розташування та технічні деталі ми узгодимо з вами в чаті!
                  </p>
                </div>
              </div>
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
            <h2 className="text-2xl font-bold mb-2 text-center">Готуємо візуалізацію...</h2>
          </div>
        )}

        {generatedResult && !isGenerating && (
          <div className="w-full max-w-5xl flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ваш результат</h2>
                <p className="text-gray-500">Приблизний вигляд готової продукції</p>
              </div>
              <button onClick={() => setGeneratedResult(false)} className="text-sm font-medium text-gray-500 flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border">
                <RefreshCw size={16} /> Почати заново
              </button>
            </div>
            
            {/* ТУТ ВІДБУВАЄТЬСЯ МАГІЯ НАКЛАДАННЯ */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-2xl border border-gray-100 w-full">
              {renderMockup()}
            </div>

            <div className="mt-8 flex justify-center">
              <button onClick={handleTelegramOrder} className="px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center gap-2 transition-transform hover:scale-105" style={{ backgroundColor: product.themeColor }}>
                Утвердити та обговорити в Telegram <Send size={24} />
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Модальне вікно розмірної сітки */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setIsSizeModalOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Розмірна сітка</h3>
              <button onClick={() => setIsSizeModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                      <tr>
                        <th className="p-3 border-b">Розмір</th>
                        <th className="p-3 border-b text-red-600">Ширина (А)</th>
                        <th className="p-3 border-b text-blue-600">Довжина (В)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                      <tr><td className="p-3">S</td><td className="p-3">48</td><td className="p-3">68</td></tr>
                      <tr><td className="p-3">M</td><td className="p-3">51</td><td className="p-3">70</td></tr>
                      <tr><td className="p-3">L</td><td className="p-3">54</td><td className="p-3">72</td></tr>
                      <tr><td className="p-3">XL</td><td className="p-3">58</td><td className="p-3">75</td></tr>
                      <tr><td className="p-3">XXL</td><td className="p-3">63</td><td className="p-3">78</td></tr>
                    </tbody>
                  </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
