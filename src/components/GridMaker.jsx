import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Flame, Loader2, LayoutGrid, CheckSquare, Square, Filter } from 'lucide-react';

export default function GridMaker({ nfts, burnedCount, hasMore, onLoadMore, loadingMore }) {
  const [cols, setCols] = useState(5);
  // Store IDs that the user has EXPLICITLY unselected. 
  // This ensures newly loaded NFTs are selected by default.
  const [unselectedIds, setUnselectedIds] = useState(new Set());
  const gridRef = useRef(null);

  const toggleSelection = (id) => {
    setUnselectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const selectAll = () => setUnselectedIds(new Set());
  
  const deselectAll = () => setUnselectedIds(new Set(nfts.map(n => n.id)));

  const selectByTier = (tier) => {
    const newUnselected = new Set();
    nfts.forEach(nft => {
      const nftTier = nft.attributes?.find(a => a.trait_type === 'Tier')?.value;
      if (nftTier !== tier) {
        newUnselected.add(nft.id);
      }
    });
    setUnselectedIds(newUnselected);
  };

  const selectedNfts = nfts.filter(nft => !unselectedIds.has(nft.id));

  const downloadGrid = async () => {
    if (!gridRef.current) return;
    try {
      // Temporarily hide unselected items from the DOM during export
      // We do this by relying on the fact that we ONLY render selectedNfts in the export container!
      // Wait, if we want the preview to show everything but export only selected, 
      // we need a hidden container or just render only selected ones in the main grid!
      // The user requested: "bırak insanlar kaç tane seçiyorsa ona göre download etsin"
      // If we only render selected ones in the gridRef, the export will naturally only have selected ones.
      
      const dataUrl = await toPng(gridRef.current, {
        backgroundColor: '#111111',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `tollbound-grid-${selectedNfts.length}-nfts.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Download failed. Make sure images are loaded.');
    }
  };

  if (nfts.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-[#39ff14]/30">
        <p className="text-xl text-[#39ff14]">No TOLLBOUND NFTs found in this wallet.</p>
        <p className="text-gray-500 mt-2 text-sm">Buy some to use the Grid Maker!</p>
      </div>
    );
  }

  // Tiers available in the currently loaded NFTs
  const availableTiers = [...new Set(nfts.map(nft => nft.attributes?.find(a => a.trait_type === 'Tier')?.value).filter(Boolean))];

  return (
    <div className="space-y-8 pb-12">
      {/* Control Panel */}
      <div className="flex flex-col gap-6 bg-black p-6 border-2 border-[#39ff14]">
        
        {/* Header & Main Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-[#39ff14] uppercase">Your Tollbound Grid</h2>
            <p className="text-gray-400 text-sm mt-1">
              Loaded {nfts.length} NFTs. <span className="text-white font-bold">{selectedNfts.length} Selected</span> for export.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center bg-zinc-900 border-2 border-[#39ff14] text-[#39ff14] p-1">
              <span className="px-3 font-bold uppercase text-sm">Columns</span>
              <select 
                value={cols} 
                onChange={e => setCols(Number(e.target.value))}
                className="bg-black text-[#39ff14] p-2 font-bold outline-none"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={downloadGrid}
              disabled={selectedNfts.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#39ff14] text-black font-black uppercase px-6 py-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} /> Download Grid ({selectedNfts.length})
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest mr-4">
            <Filter size={14} /> Filters:
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={selectAll} className="px-3 py-1.5 text-xs font-bold uppercase border border-zinc-700 hover:border-[#39ff14] hover:text-[#39ff14] transition-colors text-white">
              Select All
            </button>
            <button onClick={deselectAll} className="px-3 py-1.5 text-xs font-bold uppercase border border-zinc-700 hover:border-red-500 hover:text-red-500 transition-colors text-white">
              Deselect All
            </button>
            
            <div className="w-px h-6 bg-zinc-800 mx-2 self-center hidden md:block"></div>
            
            {availableTiers.map(tier => (
              <button 
                key={tier}
                onClick={() => selectByTier(tier)}
                className="px-3 py-1.5 text-xs font-bold uppercase border border-purple-500/30 text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                Only {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Grid (Interactive UI for picking NFTs) */}
      <div className="bg-zinc-950 border border-zinc-900 p-6">
        <h3 className="text-[#39ff14] uppercase font-bold tracking-widest text-sm mb-4">Click NFTs to Select/Deselect for Export</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {nfts.map((nft) => {
            const isSelected = !unselectedIds.has(nft.id);
            const tier = nft.attributes?.find(a => a.trait_type === 'Tier')?.value || 'Unknown';
            
            return (
              <div 
                key={nft.id} 
                onClick={() => toggleSelection(nft.id)}
                className={`relative aspect-square cursor-pointer transition-all border-2 ${isSelected ? 'border-[#39ff14] scale-100 opacity-100' : 'border-transparent scale-95 opacity-40 hover:opacity-70'}`}
              >
                <img src={nft.image} alt={`TOLL #${nft.id}`} className="w-full h-full object-contain bg-black" />
                <div className="absolute top-1 left-1">
                  {isSelected ? (
                    <CheckSquare size={16} className="text-[#39ff14] bg-black" />
                  ) : (
                    <Square size={16} className="text-gray-500 bg-black" />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] text-[#39ff14] font-mono text-center py-0.5 border-t border-[#39ff14]/30">
                  #{nft.id} • {tier}
                </div>
              </div>
            );
          })}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={onLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 bg-transparent border border-zinc-700 text-zinc-400 font-bold uppercase text-xs px-4 py-2 hover:border-[#39ff14] hover:text-[#39ff14] transition-colors disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <LayoutGrid size={14} />}
              {loadingMore ? "Loading..." : `Load More NFTs`}
            </button>
          </div>
        )}
      </div>

      {/* Export Preview (What actually gets exported) */}
      <div className="space-y-4">
        <h3 className="text-[#39ff14] uppercase font-bold tracking-widest text-sm flex items-center gap-2">
          Export Preview <span className="text-zinc-500 text-xs">(Only selected NFTs are shown here)</span>
        </h3>
        
        <div className="w-full border border-zinc-900 bg-[#0a0a0a] p-4">
          <div 
            ref={gridRef}
            className="bg-[#111111] p-8 min-h-[400px] w-full flex flex-col gap-12"
          >
            {/* Grid Container */}
            <div 
              className="grid gap-4 place-items-center w-full"
              style={{ gridTemplateColumns: `repeat(${Math.min(cols, Math.max(1, selectedNfts.length))}, minmax(0, 1fr))` }}
            >
              {selectedNfts.length === 0 ? (
                <div className="col-span-full h-full flex items-center justify-center text-zinc-600 font-mono text-lg py-20">
                  No NFTs Selected
                </div>
              ) : (
                selectedNfts.map((nft) => (
                  <div key={nft.id} className="w-full aspect-square max-w-2xl mx-auto flex items-center justify-center relative overflow-hidden bg-black border border-zinc-800">
                    <img src={nft.image} alt={`TOLL #${nft.id}`} className="w-full h-full object-contain" />
                    <div className={`absolute ${cols >= 8 ? 'bottom-1 left-1 text-[8px] px-1 py-0.5' : cols >= 5 ? 'bottom-2 left-2 text-[10px] px-2 py-1' : 'bottom-3 left-3 text-xs px-3 py-1'} max-w-[90%] whitespace-nowrap overflow-hidden text-ellipsis bg-black/90 border border-[#39ff14] text-[#39ff14] font-mono uppercase font-bold flex items-center gap-1`}>
                      TOLL #{nft.id}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Redesigned Prominent Watermark (Relative Flow) */}
            <div className="flex flex-col items-center gap-6 pt-8 mt-auto border-t border-[#39ff14]/20">
              {/* Tollbound Branding */}
              <span className="text-[#39ff14] font-black text-3xl md:text-5xl tracking-[0.3em] uppercase opacity-90 drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
                I AM TOLLBOUND
              </span>
              
              {/* Massive Burn Indicator */}
              {burnedCount > 0 && (
                <div className="bg-black/90 border-4 border-[#ff00ff] px-12 py-4 transform -skew-x-12 shadow-[0_0_30px_rgba(255,0,255,0.6)]">
                  <span className="text-[#ff00ff] font-black text-4xl md:text-6xl tracking-widest uppercase flex items-center gap-4 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
                    <Flame size={48} strokeWidth={3} /> 
                    {burnedCount} TOLLS PAID
                    <Flame size={48} strokeWidth={3} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
