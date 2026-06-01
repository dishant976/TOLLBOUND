import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Circle, Square as SquareIcon, Palette, Droplet, LayoutGrid } from 'lucide-react';

export default function PfpMaker({ nfts }) {
  const [selectedId, setSelectedId] = useState(nfts.length > 0 ? nfts[0].id : null);
  const [shape, setShape] = useState('circle'); // 'circle' | 'square'
  const [bgStyle, setBgStyle] = useState('neon-grid');
  const [borderColor, setBorderColor] = useState('green');
  const [borderThickness, setBorderThickness] = useState('thick');
  const [showWatermark, setShowWatermark] = useState(true);
  
  const pfpRef = useRef(null);

  // If nfts load later, select the first one automatically
  useEffect(() => {
    if (nfts.length > 0 && !selectedId) {
      setSelectedId(nfts[0].id);
    }
  }, [nfts, selectedId]);

  const selectedNft = nfts.find(n => n.id === selectedId);

  const downloadPfp = async () => {
    if (!pfpRef.current) return;
    try {
      const dataUrl = await toPng(pfpRef.current, {
        cacheBust: true,
        // Using pixelRatio 2 ensures a 1080x1080ish export from a 540x540 container
        pixelRatio: 2, 
        backgroundColor: 'transparent'
      });
      const link = document.createElement('a');
      link.download = `tollbound-pfp-${selectedId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate PFP', err);
      alert('Download failed. Please try again.');
    }
  };

  if (nfts.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-purple-500/30">
        <p className="text-xl text-purple-400">Load some NFTs in the Grid Maker tab first!</p>
      </div>
    );
  }

  // Background configurations
  const backgrounds = {
    'solid-black': 'bg-black',
    'solid-zinc': 'bg-zinc-900',
    'neon-grid': 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0zOUgxVjM5aDM4eiIgZmlsbD0iIzM5ZmYxNDIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=")] bg-black',
    'neon-pink-grid': 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0zOUgxVjM5aDM4eiIgZmlsbD0iI2ZmMDBmZjIwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=")] bg-[#110011]',
    'purple-glow': 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/50 via-black to-black',
    'toxic-glow': 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#39ff14]/30 via-black to-black'
  };

  const borderColors = {
    'green': 'border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.5)]',
    'pink': 'border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.5)]',
    'white': 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]',
    'none': 'border-transparent shadow-none'
  };

  const borderWeights = {
    'none': 'border-0',
    'thin': 'border-2',
    'thick': 'border-8',
    'massive': 'border-[16px]'
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls Sidebar */}
      <div className="w-full lg:w-[400px] bg-black border-2 border-purple-500 p-6 flex flex-col gap-6 shrink-0">
        <h2 className="text-2xl font-black text-purple-400 uppercase tracking-widest border-b border-purple-500/30 pb-4">
          PFP Maker
        </h2>

        {/* NFT Selector */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
            <LayoutGrid size={14} /> Select Token
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {nfts.map(nft => (
              <button
                key={nft.id}
                onClick={() => setSelectedId(nft.id)}
                className={`w-16 h-16 shrink-0 border-2 transition-all p-1 bg-zinc-900 ${
                  selectedId === nft.id ? 'border-purple-500 scale-105 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={nft.image} alt={`#${nft.id}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Shape Toggle */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
            Shape
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShape('circle')}
              className={`py-3 flex items-center justify-center gap-2 font-bold uppercase text-sm border-2 transition-colors ${
                shape === 'circle' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-transparent border-zinc-800 text-gray-500 hover:border-gray-500'
              }`}
            >
              <Circle size={16} /> Circle
            </button>
            <button
              onClick={() => setShape('square')}
              className={`py-3 flex items-center justify-center gap-2 font-bold uppercase text-sm border-2 transition-colors ${
                shape === 'square' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-transparent border-zinc-800 text-gray-500 hover:border-gray-500'
              }`}
            >
              <SquareIcon size={16} /> Square
            </button>
          </div>
        </div>

        {/* Background Select */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
            <Palette size={14} /> Background
          </label>
          <select 
            value={bgStyle}
            onChange={(e) => setBgStyle(e.target.value)}
            className="w-full bg-zinc-900 border-2 border-purple-500/50 text-white p-3 font-bold uppercase outline-none"
          >
            <option value="solid-black">Solid Black</option>
            <option value="solid-zinc">Solid Dark Gray</option>
            <option value="neon-grid">Neon Green Grid</option>
            <option value="neon-pink-grid">Neon Pink Grid</option>
            <option value="toxic-glow">Toxic Glow</option>
            <option value="purple-glow">Void Glow</option>
          </select>
        </div>

        {/* Border Config */}
        <div className="space-y-3 border-t border-purple-500/30 pt-6">
          <label className="text-xs uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
            <Droplet size={14} /> Frame Style
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Color</span>
              <select 
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-zinc-700 text-white p-2 font-bold uppercase outline-none text-xs"
              >
                <option value="green">Neon Green</option>
                <option value="pink">Neon Pink</option>
                <option value="white">Pure White</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Thickness</span>
              <select 
                value={borderThickness}
                onChange={(e) => setBorderThickness(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-zinc-700 text-white p-2 font-bold uppercase outline-none text-xs"
              >
                <option value="none">None</option>
                <option value="thin">Thin</option>
                <option value="thick">Thick</option>
                <option value="massive">Massive</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Watermark Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <input 
            type="checkbox" 
            id="watermark" 
            checked={showWatermark}
            onChange={(e) => setShowWatermark(e.target.checked)}
            className="w-5 h-5 accent-purple-500 cursor-pointer"
          />
          <label htmlFor="watermark" className="text-sm font-bold text-gray-300 uppercase cursor-pointer">
            Include "Tollbound" Text
          </label>
        </div>

        <button 
          onClick={downloadPfp}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-500 text-white font-black uppercase tracking-widest px-6 py-4 hover:bg-white hover:text-purple-600 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        >
          <Download size={20} /> Export High-Res
        </button>
      </div>

      {/* Preview Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-zinc-950 border border-zinc-900 p-8">
        <h3 className="text-gray-500 font-bold tracking-widest uppercase mb-8 text-sm text-center">
          PFP Preview<br/><span className="text-[10px] font-normal">Will export as 1080x1080 PNG</span>
        </h3>
        
        {selectedNft ? (
          /* The wrapper for rendering. Fixed size to ensure standard export. */
          <div className="relative flex items-center justify-center p-8 bg-zinc-950 border border-zinc-800/50">
            {/* The actual exportable ref container */}
            <div 
              ref={pfpRef}
              className={`
                w-[400px] h-[400px] md:w-[500px] md:h-[500px] overflow-hidden flex items-center justify-center relative
                ${shape === 'circle' ? 'rounded-full' : 'rounded-none'}
                ${backgrounds[bgStyle]}
                ${borderWeights[borderThickness]}
                ${borderColor !== 'none' && borderThickness !== 'none' ? borderColors[borderColor] : ''}
              `}
              style={{
                // Ensure html-to-image captures proper dimensions
                boxSizing: 'border-box'
              }}
            >
              <img 
                src={selectedNft.image} 
                alt="PFP" 
                className="w-[85%] h-[85%] object-contain z-10"
              />
              
              {showWatermark && (
                <div className="absolute bottom-6 left-0 right-0 text-center z-20 pointer-events-none">
                  <span 
                    className="font-black tracking-[0.2em] uppercase text-sm md:text-lg"
                    style={{
                      color: borderColor === 'pink' ? '#ff00ff' : borderColor === 'white' ? '#ffffff' : '#39ff14',
                      textShadow: `0 0 10px ${borderColor === 'pink' ? '#ff00ff' : borderColor === 'white' ? '#ffffff' : '#39ff14'}`
                    }}
                  >
                    Tollbound
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-[400px] h-[400px] border border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 font-mono">
            No NFT Selected
          </div>
        )}
      </div>
    </div>
  );
}
