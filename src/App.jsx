import { useState, useRef } from 'react';
import LandingScreen from './components/LandingScreen';
import Dashboard from './components/Dashboard';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const audioRef = useRef(null);

  const handleEnter = (address) => {
    setWalletAddress(address);
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((e) => console.log('Audio autoplay blocked', e));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#39ff14] selection:text-black">
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3" type="audio/mpeg" />
      </audio>
      {!walletAddress ? (
        <LandingScreen onEnter={handleEnter} onPlayMusic={playMusic} />
      ) : (
        <Dashboard walletAddress={walletAddress} onDisconnect={handleDisconnect} />
      )}
    </div>
  );
}

export default App;
