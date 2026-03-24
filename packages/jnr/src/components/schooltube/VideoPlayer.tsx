'use client';

import { useState, useEffect, useCallback } from 'react';

type VideoPlayerProps = {
  reel: { id: string; title: string; videoUrl?: string };
  open: boolean;
  onClose: () => void;
};

function getYouTubeEmbedUrl(url: string): string {
  let videoId = '';

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    const params = new URLSearchParams(url.split('?')[1]);
    videoId = params.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }

  return videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : '';
}

export function VideoPlayer({ reel, open, onClose }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && reel.videoUrl) {
      setEmbedUrl(getYouTubeEmbedUrl(reel.videoUrl));
      setIsLoading(true);
    }
  }, [open, reel.videoUrl]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Playing: ${reel.title}`}
    >
      {/* Video container */}
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden mx-4">
        {isLoading && embedUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={reel.title}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3D2E1F]">
            <div className="flex flex-col items-center gap-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" fill="#E8610A" />
              </svg>
              <p className="text-[#E8E0D6] text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                Video coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Close button - large touch target */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-14 h-14 rounded-full bg-black/50
                   flex items-center justify-center
                   hover:bg-black/70 transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
        aria-label="Close video"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Title bar at bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <h2
          className="text-white text-lg font-bold"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {reel.title}
        </h2>
      </div>
    </div>
  );
}
