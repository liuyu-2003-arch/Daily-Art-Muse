import React from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';

interface RandomButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const RandomButton: React.FC<RandomButtonProps> = ({ onClick, isLoading }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      className="absolute top-6 right-6 z-50 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white group overflow-hidden"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Ripple/Gradient Effect Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
      />
      
      {/* Icon: Using Lucide Shuffle which represents two crossed curved lines */}
      <div className="relative">
        <Shuffle 
            size={28} 
            className={`transition-transform duration-700 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} 
            strokeWidth={2.5}
        />
      </div>
      
      {/* Tooltip hint on Desktop */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/70 text-xs rounded text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
        Random Discovery
      </span>
    </motion.button>
  );
};

export default RandomButton;
