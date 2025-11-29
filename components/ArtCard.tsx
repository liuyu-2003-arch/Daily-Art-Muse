import React from 'react';
import { PexelsPhoto } from '../types';
import { motion } from 'framer-motion';

interface ArtCardProps {
  photo: PexelsPhoto;
  isActive: boolean;
}

const ArtCard: React.FC<ArtCardProps> = ({ photo, isActive }) => {
  if (!photo) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Background Image (Blurred) for fill */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
        style={{ backgroundImage: `url(${photo.src.small})` }}
      />

      {/* Main Image */}
      <motion.img
        src={photo.src.large2x} // Use high quality for artwork
        alt={photo.alt || 'Art piece'}
        className="absolute inset-0 w-full h-full object-cover z-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: isActive ? 1 : 1.1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        loading="eager" // We handle preloading manually, but this helps
        draggable={false}
      />

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24 pb-12 px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isActive ? 0 : 20, opacity: isActive ? 1 : 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-white text-3xl font-serif font-bold leading-tight mb-2 drop-shadow-md">
            {photo.alt || "Untitled Masterpiece"}
          </h2>
          <div className="flex items-center space-x-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/30">
                {/* Fallback avatar simply using the average color */}
                <div 
                    className="w-full h-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: photo.avg_color || '#555' }}
                >
                    {photo.photographer.charAt(0)}
                </div>
            </div>
            <p className="text-gray-200 text-lg font-medium drop-shadow-sm">
              {photo.photographer}
            </p>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 opacity-80">
            <span className="text-xs border border-white/30 rounded-full px-3 py-1 bg-black/20 backdrop-blur-sm">
              Daily Art
            </span>
            {photo.avg_color && (
                <span className="text-xs border border-white/30 rounded-full px-3 py-1 bg-black/20 backdrop-blur-sm flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor: photo.avg_color}}></span>
                 Palette
                </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtCard;
