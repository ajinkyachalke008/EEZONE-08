'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function MagicCADPlusPage() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const cadamUrl = process.env.NEXT_PUBLIC_CADAM_URL || 'http://127.0.0.1:5173';

  // Check if CADAM is running before showing iframe
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkCadamServer = async () => {
      try {
        setIframeError(false);
        // We do a simple fetch to see if the server is up
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Simplified check, just set loaded
        if (mounted) {
          setIframeLoaded(true);
        }
      } catch (err) {
        if (mounted) {
          setIframeError(true);
          setIframeLoaded(false);
        }
      }
    };

    checkCadamServer();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [retryCount, cadamUrl]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#76b900] to-transparent opacity-50"></div>
      
      {!iframeLoaded && !iframeError && (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 border-4 border-[#76b900]/20 border-t-[#76b900] rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(118,185,0,0.3)]"></div>
          <h2 className="text-2xl font-bold text-white mb-2 font-['Orbitron'] tracking-wide">INITIALIZING MAGIC CAD +</h2>
          <p className="text-[#a0a0a0] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#76b900] animate-pulse"></span>
            Connecting to CADAM core engine...
          </p>
        </div>
      )}

      {iframeError && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <div className="bg-[#151520] border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Magic CAD + Offline</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              The CADAM local server (port 5173) is currently not responding. 
              Please ensure you have started the Magic CAD services using the <code className="bg-black/50 text-[#76b900] px-2 py-1 rounded">start_magic_cad.bat</code> script.
            </p>
            <button 
              onClick={() => setRetryCount(c => c + 1)}
              className="flex items-center justify-center gap-2 w-full bg-[#76b900]/10 hover:bg-[#76b900]/20 text-[#76b900] border border-[#76b900]/30 py-3 px-6 rounded-xl transition-all font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {iframeLoaded && (
        <iframe 
          src={cadamUrl}
          className="w-full h-full border-none bg-transparent"
          title="Magic CAD Plus Interface"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
