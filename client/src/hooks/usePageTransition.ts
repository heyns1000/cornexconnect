import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export const usePageTransition = () => {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState(location);

  useEffect(() => {
    if (location !== currentPath) {
      setIsTransitioning(true);
      
      // Start exit animation
      const exitTimer = setTimeout(() => {
        setCurrentPath(location);
        
        // Start enter animation
        const enterTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 100);

        return () => clearTimeout(enterTimer);
      }, 200);

      return () => clearTimeout(exitTimer);
    }
  }, [location, currentPath]);

  return {
    isTransitioning,
    currentPath,
    location
  };
};