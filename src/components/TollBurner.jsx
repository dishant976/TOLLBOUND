import { useState } from 'react';
import { Flame, Coins } from 'lucide-react';

export default function TollBurner({ nfts, actualBurns = 0 }) {
  const maxBurns = Math.max(10, nfts.length + actualBurns);
  const [burns, setBurns] = useState(actualBurns);

  const TOKEN_RATE = 10000; // 1 Burn = 10,000 $TOLL
  
  const getBurnStage = (count) => {
    if (count === 0) return { title: 'RAW SOUL', desc: 'The Toll Collector yawns. You have sacrificed nothing.' };
    if (count === 1) return { title: 'GATE MARKED', desc: 'Your NFT lost its shoes. Here is some $TOLL for your trouble.' };
    if (count === 2) return { title: 'ORACLE WITNESS', desc: 'The Toll Collector is amused. Your NFT is now half-naked.' };
    if (count === 3) return { title: 'ASCENDED', desc: 'Absolute dedication. You are burning your JPEGs for imaginary coins.' };
    return { title: 'THE UNBOUND 🔥', desc: 'You are either a genius or completely reckless.' };
  };

  const stage = getBurnStage(burns);
  const projectedTokens = burns * TOKEN_RATE;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-[#ff00ff] uppercase text-shadow-neon-pink">
          Toll Calculator
        </h2>
        <p className="text-gray-400 font-mono">1 Burn = {TOKEN_RATE.toLocaleString()} $TOLL</p>
      </div>

      <div className="bg-black border-2 border-[#ff00ff] p-8 space-y-8 box-shadow-neon-pink">
        <div className="space-y-6">
          <div className="flex justify-between text-[#ff00ff] font-bold font-mono">
            <span>0 Burns</span>
            <span>{maxBurns} Burns</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={maxBurns} 
            value={burns}
            onChange={(e) => setBurns(Number(e.target.value))}
            className="w-full accent-[#ff00ff] h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-800">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">
              {burns === actualBurns && actualBurns > 0 ? "Actual Burns" : "Simulated Burns"}
            </div>
            <div className="text-5xl font-black text-white flex items-center justify-center md:justify-start gap-3">
              <Flame className="text-[#ff00ff]" size={40} />
              {burns}
            </div>
            <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800">
              <div className="text-[#ff00ff] font-bold uppercase tracking-wider mb-2">{stage.title}</div>
              <div className="text-sm text-gray-400 italic">"{stage.desc}"</div>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-right">
            <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Projected Allocation</div>
            <div className="text-5xl font-black text-[#39ff14] text-shadow-neon-green flex items-center justify-center md:justify-end gap-3">
              {projectedTokens.toLocaleString()}
              <Coins size={40} />
            </div>
            <div className="mt-4 p-4 text-sm font-mono text-[#39ff14]/70">
              * This is a simulation. No real tokens or NFTs are being burned yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
