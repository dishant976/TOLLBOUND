import { useMemo } from 'react';
import { Trophy, ShieldAlert, Award, Hash, Flame, Lock } from 'lucide-react';

export default function Scoreboard({ nfts, burnedCount, allOwnedIds, walletAddress }) {
  // If they have loaded 50 but actually own 150, we should warn them 
  // that the score is partial until they load all NFTs.
  const isPartial = nfts.length < allOwnedIds.length;

  const { score, stats } = useMemo(() => {
    let currentScore = 0;
    
    // Base stats from simple counts
    const baseNftScore = nfts.length * 10;
    const baseBurnScore = burnedCount * 50;
    currentScore += baseNftScore + baseBurnScore;

    const newStats = {
      totalNfts: nfts.length,
      totalBurns: burnedCount,
      inscribedCount: 0,
      freeWillCount: 0,
      tiers: {
        'Common': 0,
        'Gate Marked': 0,
        'Oracle-marked': 0,
        'Ascended': 0,
        'The Unbound': 0,
        'Unknown': 0
      }
    };

    const tierPoints = {
      'Common': 10,
      'Gate Marked': 30,
      'Oracle-marked': 100,
      'Ascended': 250,
      'The Unbound': 1000
    };

    nfts.forEach(nft => {
      // Parse Attributes
      const tier = nft.attributes?.find(a => a.trait_type === 'Tier')?.value || 'Unknown';
      const inscription = nft.attributes?.find(a => a.trait_type === 'Inscription')?.value || 'None';
      const freeWill = nft.attributes?.find(a => a.trait_type === 'Free Will')?.value || 'None';

      // Tier Calculation
      if (newStats.tiers[tier] !== undefined) {
        newStats.tiers[tier]++;
      } else {
        newStats.tiers['Unknown']++;
      }
      
      if (tierPoints[tier]) {
        currentScore += tierPoints[tier];
      }

      // Inscription Bonus
      if (inscription !== 'None') {
        newStats.inscribedCount++;
        currentScore += 100;
      }

      // Free Will Bonus
      if (freeWill !== 'None') {
        newStats.freeWillCount++;
        currentScore += 50;
      }
    });

    return { score: currentScore, stats: newStats };
  }, [nfts, burnedCount]);

  // Determine Rank
  let rank = "Novice";
  let rankColor = "text-gray-400";
  let rankBg = "bg-gray-400/10 border-gray-500/50";
  
  if (score >= 5000) {
    rank = "Unbound Master";
    rankColor = "text-[#ff00ff]";
    rankBg = "bg-[#ff00ff]/10 border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.4)]";
  } else if (score >= 2000) {
    rank = "Ascended";
    rankColor = "text-yellow-400";
    rankBg = "bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]";
  } else if (score >= 500) {
    rank = "Oracle";
    rankColor = "text-[#00f0ff]";
    rankBg = "bg-[#00f0ff]/10 border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]";
  } else if (score >= 100) {
    rank = "Marked";
    rankColor = "text-[#39ff14]";
    rankBg = "bg-[#39ff14]/10 border-[#39ff14]/50 shadow-[0_0_10px_rgba(57,255,20,0.2)]";
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Header Profile Section */}
      <div className={`p-8 border-2 flex flex-col md:flex-row items-center gap-8 ${rankBg} transition-all duration-500`}>
        <div className="w-32 h-32 rounded-full bg-black border-4 border-current flex items-center justify-center shrink-0" style={{ color: rankColor.replace('text-', '') }}>
          <Trophy size={64} className={rankColor} />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="text-gray-400 font-mono text-sm mb-1 uppercase tracking-widest">Tollbound Identity</h2>
            <div className="text-xl md:text-2xl font-bold font-mono text-white break-all bg-black/50 px-4 py-2 border border-zinc-800">
              {walletAddress}
            </div>
          </div>
          
          <div>
            <h3 className="text-gray-400 font-mono text-sm mb-1 uppercase tracking-widest">Current Rank</h3>
            <div className={`text-4xl md:text-6xl font-black uppercase tracking-widest ${rankColor} drop-shadow-md`}>
              {rank}
            </div>
          </div>
        </div>

        <div className="text-center bg-black/60 p-6 border border-zinc-800 min-w-[200px]">
          <h3 className="text-gray-400 font-mono text-sm mb-2 uppercase tracking-widest">Total Score</h3>
          <div className="text-5xl font-black text-white">{score.toLocaleString()}</div>
          {isPartial && (
            <div className="text-xs text-yellow-500 mt-2 flex items-center justify-center gap-1">
              <ShieldAlert size={12} /> Load more NFTs for full score
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Stats */}
        <div className="bg-black border border-zinc-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-4 flex items-center gap-2">
            <Award size={20} className="text-[#39ff14]" /> Core Statistics
          </h3>
          
          <div className="space-y-4">
            <StatRow 
              icon={<Hash size={18} className="text-gray-400" />} 
              label="NFTs Held (Loaded)" 
              value={stats.totalNfts} 
              subtext={`+${stats.totalNfts * 10} pts`} 
            />
            <StatRow 
              icon={<Flame size={18} className="text-[#ff00ff]" />} 
              label="TOLLS PAID" 
              value={stats.totalBurns} 
              subtext={`+${stats.totalBurns * 50} pts`}
              valueColor="text-[#ff00ff]"
            />
            <StatRow 
              icon={<Lock size={18} className="text-[#00f0ff]" />} 
              label="Inscribed Tokens" 
              value={stats.inscribedCount} 
              subtext={`+${stats.inscribedCount * 100} pts`}
              valueColor="text-[#00f0ff]"
            />
            <StatRow 
              icon={<Award size={18} className="text-yellow-400" />} 
              label="Free Will Intact" 
              value={stats.freeWillCount} 
              subtext={`+${stats.freeWillCount * 50} pts`}
              valueColor="text-yellow-400"
            />
          </div>
        </div>

        {/* Tier Collection */}
        <div className="bg-black border border-zinc-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-4 flex items-center gap-2">
            <ShieldAlert size={20} className="text-purple-500" /> Tier Collection
          </h3>
          
          <div className="space-y-4">
            <TierRow label="Common" value={stats.tiers['Common']} points={10} color="text-gray-300" />
            <TierRow label="Gate Marked" value={stats.tiers['Gate Marked']} points={30} color="text-[#39ff14]" />
            <TierRow label="Oracle-marked" value={stats.tiers['Oracle-marked']} points={100} color="text-[#00f0ff]" />
            <TierRow label="Ascended" value={stats.tiers['Ascended']} points={250} color="text-yellow-400" />
            <TierRow label="The Unbound" value={stats.tiers['The Unbound']} points={1000} color="text-[#ff00ff]" />
          </div>
        </div>

      </div>

      <div className="text-center text-xs text-zinc-600 font-mono mt-8 border-t border-zinc-900 pt-8">
        Tollbound Score is a community metric calculated locally based on your loaded NFTs and on-chain metadata.
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, subtext, valueColor = "text-white" }) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors border border-zinc-800/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-sm text-gray-300 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 font-mono">{subtext}</span>
        <span className={`font-black text-xl ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
}

function TierRow({ label, value, points, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors border border-zinc-800/50">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`}></span>
        <span className={`font-bold text-sm uppercase tracking-wider ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 font-mono">+{points} pts each</span>
        <span className="font-black text-xl text-white">{value}</span>
      </div>
    </div>
  );
}
