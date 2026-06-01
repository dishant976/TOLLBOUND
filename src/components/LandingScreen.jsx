import { useState, useRef } from 'react';
import { Play, Volume2, Wallet } from 'lucide-react';

export default function LandingScreen({ onEnter, onPlayMusic }) {
  const [address, setAddress] = useState('');
  const [entered, setEntered] = useState(false);

  const handleInitialClick = () => {
    setEntered(true);
    if (onPlayMusic) {
      onPlayMusic();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      onEnter(address.trim());
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background elements - No glassmorphism, just glowing orbs and solid gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] to-[#0a0a0a]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39ff14]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff00ff]/10 rounded-full blur-[100px]"></div>
      
      {/* Grid lines for a 'roadside/synthwave' feel */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(transparent_95%,#ff00ff_100%),linear-gradient(90deg,transparent_95%,#ff00ff_100%)] bg-[length:50px_50px] opacity-20 transform perspective-[1000px] rotateX-[60deg]"></div>

      <div className="relative z-10 w-full max-w-md mx-auto p-8 border-2 border-[#39ff14] bg-black box-shadow-neon-green">
        <h1 className="text-5xl font-black mb-2 text-center text-white tracking-widest uppercase text-shadow-neon-green">
          Tollbound
        </h1>
        <p className="text-center text-[#ff00ff] mb-10 tracking-widest text-sm font-bold uppercase">
          Pay the toll • Stay bound
        </p>

        {!entered ? (
          <button 
            onClick={handleInitialClick}
            className="w-full py-6 flex flex-col items-center justify-center gap-4 bg-[#39ff14] text-black font-black uppercase text-xl hover:bg-white transition-colors"
          >
            <Play size={32} />
            <span>Enter The Highway</span>
            <span className="text-xs opacity-70 flex items-center gap-2"><Volume2 size={14} /> Enables Music</span>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#39ff14]">Wallet Address / ENS</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Wallet size={18} className="text-[#39ff14]" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-[#39ff14] text-white pl-12 pr-4 py-4 outline-none transition-colors font-mono"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-[#ff00ff] text-white font-bold uppercase tracking-wider hover:bg-[#ff00ff]/80 transition-colors border-2 border-[#ff00ff]"
            >
              Connect & Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
