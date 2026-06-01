import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Type, PaintBucket, Maximize2 } from 'lucide-react';

export default function BannerMaker({ nfts }) {
  const [text, setText] = useState('I AM #TOLLBOUND');
  const [selectedNft, setSelectedNft] = useState(nfts[0] || null);
  
  // Customization States
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textSize, setTextSize] = useState('text-6xl lg:text-8xl');
  const [textColor, setTextColor] = useState('#ffffff');
  
  const bannerRef = useRef(null);

  const downloadBanner = async () => {
    if (!bannerRef.current) return;
    try {
      const dataUrl = await toPng(bannerRef.current, {
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = 'tollbound-banner.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate banner', err);
      alert('Download failed. Make sure images are loaded.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-black p-6 border-2 border-[#00f0ff] space-y-6">
        <h2 className="text-2xl font-black text-[#00f0ff] uppercase">Customize Banner</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Main Text Input */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#00f0ff]">Banner Text</label>
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-[#00f0ff] p-4 text-white outline-none text-xl font-black uppercase"
            />
          </div>

          {/* NFT Selection */}
          {nfts.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#00f0ff]">Select NFT</label>
              <select 
                value={selectedNft?.id || ''}
                onChange={(e) => setSelectedNft(nfts.find(n => n.id === e.target.value))}
                className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-[#00f0ff] text-white p-4 outline-none font-mono"
              >
                {nfts.map(nft => (
                  <option key={nft.id} value={nft.id}>TOLL #{nft.id}</option>
                ))}
              </select>
            </div>
          )}

          {/* Download Button */}
          <div className="flex items-end">
            <button 
              onClick={downloadBanner}
              className="w-full flex items-center justify-center gap-2 bg-[#00f0ff] text-black font-black uppercase px-8 py-4 hover:bg-white transition-colors"
            >
              <Download size={18} /> Download
            </button>
          </div>
        </div>

        {/* Styling Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#00f0ff] flex items-center gap-1">
              <Type size={14} /> Font Type
            </label>
            <select 
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-[#00f0ff] text-white p-3 outline-none"
            >
              <option value="Inter">Inter (Modern)</option>
              <option value="Times New Roman">Times New Roman (Serif)</option>
              <option value="Courier New">Courier New (Monospace)</option>
              <option value="Impact">Impact (Bold)</option>
              <option value="Comic Sans MS">Comic Sans (Fun)</option>
            </select>
          </div>

          {/* Text Size */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#00f0ff] flex items-center gap-1">
              <Maximize2 size={14} /> Text Size
            </label>
            <select 
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-[#00f0ff] text-white p-3 outline-none"
            >
              <option value="text-2xl lg:text-4xl">Small</option>
              <option value="text-4xl lg:text-6xl">Medium</option>
              <option value="text-6xl lg:text-8xl">Large</option>
              <option value="text-8xl lg:text-[9rem]">Giant</option>
            </select>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#00f0ff] flex items-center gap-1">
              <PaintBucket size={14} /> Text Color
            </label>
            <div className="flex items-center gap-2 bg-zinc-950 border-2 border-zinc-800 p-2">
              <input 
                type="color" 
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 cursor-pointer bg-transparent border-none outline-none p-0"
              />
              <span className="text-white font-mono text-sm">{textColor.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border-4 border-[#00f0ff] bg-gradient-to-r from-[#0a0a0a] to-[#1a0033] p-8">
        <div 
          ref={bannerRef}
          className="relative w-full aspect-[3/1] bg-black overflow-hidden flex items-center border-2 border-zinc-800"
        >
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,#00f0ff_100%),linear-gradient(90deg,transparent_95%,#00f0ff_100%)] bg-[length:40px_40px] opacity-10"></div>
          
          {selectedNft && (
            <div className="absolute left-10 h-[120%] aspect-square rotate-12 -translate-y-10">
              <img src={selectedNft.image} alt="NFT" className="w-full h-full object-contain opacity-50 mix-blend-screen" />
            </div>
          )}

          <div className="relative z-10 w-full text-center px-12">
            <h1 
              className={`font-black uppercase break-words ${textSize}`}
              style={{ 
                fontFamily: fontFamily, 
                color: textColor,
                textShadow: `0 0 20px ${textColor}80` // Dynamic neon shadow based on color
              }}
            >
              {text}
            </h1>
            <p className="text-xl md:text-2xl text-[#ff00ff] mt-4 font-bold tracking-[0.5em] uppercase">
              PAYED THE TOLL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
