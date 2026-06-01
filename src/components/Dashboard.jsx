import { useState, useEffect } from 'react';
import { LogOut, LayoutGrid, Image as ImageIcon, Flame, AlertCircle, Trophy, UserCircle } from 'lucide-react';
import { ethers } from 'ethers';
import GridMaker from './GridMaker';
import BannerMaker from './BannerMaker';
import Scoreboard from './Scoreboard';
import PfpMaker from './PfpMaker';

const CONTRACT_ADDRESS = "0x53792b8a1e2baf9c1b37cdf3e7789d7ee65724ac";
const ETHERSCAN_API_KEY = "R1XZT2SKDV581PWYBSV5RBJZJ9PNTGRDB9";

export default function Dashboard({ walletAddress, onDisconnect }) {
  const [activeTab, setActiveTab] = useState('grid');
  
  // Pagination & Fetching State
  const [allOwnedIds, setAllOwnedIds] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [burnedCount, setBurnedCount] = useState(0);

  // Initial fetch of token transfers and first 50 NFTs
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const txUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokennfttx&contractaddress=${CONTRACT_ADDRESS}&address=${walletAddress}&page=1&offset=10000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
        const txRes = await fetch(txUrl);
        const txData = await txRes.json();
        
        if (txData.status !== "1" && txData.message !== "No transactions found") {
          throw new Error("Failed to fetch token transfers from Etherscan");
        }

        const ownedTokens = new Set();
        const burnedTokens = new Set();
        const burnAddresses = [
          '0x000000000000000000000000000000000000dead',
          '0x0000000000000000000000000000000000000000'
        ];

        if (txData.result && Array.isArray(txData.result)) {
          for (const tx of txData.result) {
            if (tx.from.toLowerCase() === walletAddress.toLowerCase() && 
                burnAddresses.includes(tx.to.toLowerCase())) {
              burnedTokens.add(tx.tokenID);
            }

            if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
              ownedTokens.add(tx.tokenID);
            } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
              ownedTokens.delete(tx.tokenID);
            }
          }
        }
        
        setBurnedCount(burnedTokens.size);

        // We only care about currently owned IDs for display
        const tokenIds = Array.from(ownedTokens);
        setAllOwnedIds(tokenIds);
        
        if (tokenIds.length === 0) {
          setNfts([]);
          return;
        }

        // Fetch metadata for the first 50
        await fetchMetadataBatch(tokenIds.slice(0, 50), true);

      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
        setNfts([]);
        setBurnedCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchInitialData();
    }
  }, [walletAddress]);

  const fetchMetadataBatch = async (idsToFetch, isInitial = false) => {
    // Completely removed wallet connection (window.ethereum) logic as requested.
    // Using a highly reliable and fast public RPC that supports CORS.
    const provider = new ethers.JsonRpcProvider("https://ethereum.publicnode.com", 1, { staticNetwork: true });
      
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS, 
      ["function tokenURI(uint256 tokenId) view returns (string)"], 
      provider
    );

    const fetchedNfts = [];
    // Process in chunks of 20 for extremely fast parallel fetching without rate limits
    const chunkSize = 20;
    const delayMs = 0;

    for (let i = 0; i < idsToFetch.length; i += chunkSize) {
      const chunk = idsToFetch.slice(i, i + chunkSize);
      
      const promises = chunk.map(async (id) => {
        try {
          const uri = await contract.tokenURI(id);
          const base64Payload = uri.split(',')[1];
          const jsonStr = decodeURIComponent(atob(base64Payload).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const metadata = JSON.parse(jsonStr);
          return {
            id: id,
            image: metadata.image || `https://placehold.co/600x600/111/39ff14?text=TOLL%23${id}`,
            attributes: metadata.attributes || [],
            isBurned: false
          };
        } catch (e) {
          console.error(`Error fetching tokenURI for ${id}:`, e);
          return null;
        }
      });

      const results = await Promise.all(promises);
      fetchedNfts.push(...results.filter(Boolean));
      
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    if (isInitial) {
      setNfts(fetchedNfts);
    } else {
      setNfts(prev => [...prev, ...fetchedNfts]);
    }
  };

  const loadMoreNFTs = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const currentLength = nfts.length;
      const nextBatch = allOwnedIds.slice(currentLength, currentLength + 50);
      if (nextBatch.length > 0) {
        await fetchMetadataBatch(nextBatch, false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = nfts.length < allOwnedIds.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="border-b-2 border-[#39ff14] bg-black p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-[#39ff14] uppercase tracking-widest text-shadow-neon-green">
            Tollbound
          </h1>
          <div className="hidden md:flex gap-2 items-center">
            {burnedCount > 0 && (
              <span className="px-3 py-1 bg-zinc-900 border border-[#ff00ff] text-[#ff00ff] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame size={12} /> {burnedCount} TOLLS PAID
              </span>
            )}
            <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs text-gray-400 font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        </div>
        <button 
          onClick={onDisconnect}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-wider"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </header>

      <div className="bg-zinc-950 border-b border-zinc-900 flex overflow-x-auto hide-scrollbar z-10">
        <TabButton 
          active={activeTab === 'grid'} 
          onClick={() => setActiveTab('grid')}
          icon={<LayoutGrid size={18} />}
          label="Grid Maker"
          color="hover:text-[#39ff14] hover:border-[#39ff14]"
          activeColor="text-[#39ff14] border-[#39ff14]"
        />
        <TabButton 
          active={activeTab === 'banner'} 
          onClick={() => setActiveTab('banner')}
          icon={<ImageIcon size={18} />}
          label="Banner Maker"
          color="hover:text-[#00f0ff] hover:border-[#00f0ff]"
          activeColor="text-[#00f0ff] border-[#00f0ff]"
        />
        <TabButton 
          active={activeTab === 'pfp'} 
          onClick={() => setActiveTab('pfp')}
          icon={<UserCircle size={18} />}
          label="PFP Maker"
          color="hover:text-purple-400 hover:border-purple-400"
          activeColor="text-purple-400 border-purple-400"
        />
        <TabButton 
          active={activeTab === 'scoreboard'} 
          onClick={() => setActiveTab('scoreboard')}
          icon={<Trophy size={18} />}
          label="Scoreboard"
          color="hover:text-yellow-400 hover:border-yellow-400"
          activeColor="text-yellow-400 border-yellow-400"
        />
      </div>

      <main className="flex-1 p-6 relative overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-[#39ff14] flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#39ff14] border-t-transparent rounded-full animate-spin"></div>
              <p className="uppercase tracking-widest font-bold">Reading Blockchain...</p>
            </div>
          </div>
        ) : allOwnedIds.length === 0 ? (
          <div className="max-w-xl mx-auto mt-10 p-8 bg-black border-2 border-[#ff00ff] box-shadow-neon-pink space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle size={48} className="text-[#ff00ff]" />
              <h2 className="text-2xl font-black text-[#ff00ff] uppercase tracking-wider">No NFTs Found</h2>
              <p className="text-gray-400">
                {errorMsg 
                  ? "Failed to fetch data from Etherscan." 
                  : "We couldn't find any TOLLBOUND NFTs in this wallet. Make sure you are using the correct address."}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === 'grid' && (
              <GridMaker 
                nfts={nfts} 
                burnedCount={burnedCount} 
                hasMore={hasMore} 
                onLoadMore={loadMoreNFTs} 
                loadingMore={loadingMore} 
              />
            )}
            {activeTab === 'banner' && <BannerMaker nfts={nfts} />}
            {activeTab === 'pfp' && <PfpMaker nfts={nfts} />}
            {activeTab === 'scoreboard' && (
              <Scoreboard 
                nfts={nfts} 
                burnedCount={burnedCount} 
                allOwnedIds={allOwnedIds} 
                walletAddress={walletAddress} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, color, activeColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
        active ? activeColor : `text-gray-500 border-transparent ${color}`
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
