import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
      <h1 className="text-xl font-serif tracking-widest uppercase">Daily Art</h1>
      <p className="text-xs text-gray-500 mt-2">Curating masterpiece...</p>
    </div>
  );
};

export default LoadingScreen;
