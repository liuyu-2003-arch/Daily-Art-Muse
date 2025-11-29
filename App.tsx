import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { fetchArtPhotos, fetchRandomArtPhoto, preloadImage } from './services/pexelsService';
import { PexelsPhoto } from './types';
import { PRELOAD_OFFSET } from './constants';
import ArtCard from './components/ArtCard';
import RandomButton from './components/RandomButton';
import LoadingScreen from './components/LoadingScreen';

// Threshold to trigger a swipe change
const SWIPE_THRESHOLD = 50;

function App() {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  
  // Track direction for animation variants (-1 = up/prev, 1 = down/next)
  const [direction, setDirection] = useState(0);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const initialPhotos = await fetchArtPhotos(1, 10);
      setPhotos(initialPhotos);
      setLoading(false);
    };
    init();
  }, []);

  // Preloading Logic: Watch currentIndex and load future images
  useEffect(() => {
    if (photos.length === 0) return;

    // Preload next few images
    for (let i = 1; i <= PRELOAD_OFFSET; i++) {
      const nextIndex = currentIndex + i;
      if (photos[nextIndex]) {
        preloadImage(photos[nextIndex].src.large2x);
      }
    }

    // Also preload previous image just in case user goes back
    if (currentIndex > 0 && photos[currentIndex - 1]) {
      preloadImage(photos[currentIndex - 1].src.large2x);
    }

    // If we are nearing the end of the list, fetch more
    if (currentIndex >= photos.length - 3) {
      loadMorePhotos();
    }
  }, [currentIndex, photos]);

  const loadMorePhotos = async () => {
    // Determine next page based on current length (approximate)
    const nextPage = Math.floor(photos.length / 10) + 1;
    const newPhotos = await fetchArtPhotos(nextPage, 5);
    
    // Filter duplicates
    setPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = newPhotos.filter(p => !existingIds.has(p.id));
      return [...prev, ...uniqueNew];
    });
  };

  const handleRandom = async () => {
    if (randomLoading) return;
    setRandomLoading(true);
    
    // Fetch a truly random photo
    const randomPhoto = await fetchRandomArtPhoto();
    
    if (randomPhoto) {
      // Preload it immediately
      preloadImage(randomPhoto.src.large2x);
      
      // We insert the random photo immediately after the current one, 
      // then slide to it. This preserves history (Back works)
      setPhotos(prev => {
        const newPhotos = [...prev];
        // Insert at next index
        newPhotos.splice(currentIndex + 1, 0, randomPhoto);
        return newPhotos;
      });
      
      // Animate to next
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
    
    setRandomLoading(false);
  };

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < photos.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  // Handlers for Framer Motion drag
  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipePower = Math.abs(offset.y) * velocity.y;

    if (offset.y < -SWIPE_THRESHOLD) {
      // Swiped Up -> Go Next
      paginate(1);
    } else if (offset.y > SWIPE_THRESHOLD) {
      // Swiped Down -> Go Prev
      paginate(-1);
    }
  };

  // Variants for the slide transition (TikTok style vertical stack)
  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? '100%' : '-100%',
      opacity: 1,
      scale: 0.95,
      zIndex: 0
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir: number) => ({
      zIndex: 0,
      y: dir < 0 ? '100%' : '-100%', // If going down (next), current goes up (-100%)
      opacity: 0.5,
      scale: 0.95,
      transition: {
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  };

  if (loading && photos.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden touch-none">
      <RandomButton onClick={handleRandom} isLoading={randomLoading} />

      {/* Main Swipe Container */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        {photos[currentIndex] && (
          <motion.div
            key={photos[currentIndex].id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.7} // Adds resistance
            onDragEnd={onDragEnd}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            <ArtCard 
              photo={photos[currentIndex]} 
              isActive={true} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Hints (Optional, visible if not interacting for a while or on start) */}
      <div className="absolute bottom-4 right-4 z-50 pointer-events-none opacity-30 hidden md:flex flex-col items-center text-xs text-white">
        <span>Use Up/Down Arrow or Drag</span>
      </div>
      
      {/* Keyboard support */}
      <KeyboardHandler onUp={() => paginate(-1)} onDown={() => paginate(1)} onSpace={handleRandom} />
    </div>
  );
}

// Separate component for keyboard listener to keep main cleaner
const KeyboardHandler = ({ onUp, onDown, onSpace }: { onUp: () => void, onDown: () => void, onSpace: () => void }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') onDown();
            if (e.key === 'ArrowUp') onUp();
            if (e.key === ' ') onSpace();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onUp, onDown, onSpace]);
    return null;
}

export default App;
