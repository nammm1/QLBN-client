import { useState, useEffect } from 'react';

const useMedia = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    const listener = (event) => {
      setMatches(event.matches);
    };

    // Kiểm tra lại khi component mount
    setMatches(media.matches);

    // Thêm listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback cho browsers cũ
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

export default useMedia;


