
import React from 'react';
import { Dog, Cat, Loader2 } from 'lucide-react';
import { Member, StickerMood } from '../types';
import { STICKER_URLS } from '../constants';

interface StickerProps {
  member: Member;
  mood?: StickerMood;
  size?: number;
  className?: string;
}

const Sticker: React.FC<StickerProps> = ({ member, mood = 'default', size = 40, className = '' }) => {
  const imageUrl = STICKER_URLS[member];
  const isPin = member === 'Pin';

  // Fallback styling if no image provided
  const fallbackBg = isPin ? 'bg-[#ffedcc] border-[#d9b08c]' : 'bg-[#ffe4cc] border-[#d9a08c]';
  const fallbackColor = isPin ? 'text-[#d99036]' : 'text-[#d96b36]';

  // If we had a real sprite sheet, we would calculate background position here based on `mood`
  // For now, since we rely on external URLs which might be single images, we just show the image.
  // Ideally, if `imageUrl` points to a sprite, we'd add style={{ objectPosition: '...' }}
  
  if (imageUrl) {
    return (
      <div 
        className={`rounded-full overflow-hidden border-2 border-white shadow-md relative bg-white ${className}`}
        style={{ width: size, height: size }}
      >
        <img 
          src={imageUrl} 
          alt={`${member}-${mood}`} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback to Lucide Icons with "Hand-drawn" circle look
  return (
    <div 
      className={`rounded-full border-2 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-110 ${fallbackBg} ${fallbackColor} ${className}`}
      style={{ width: size, height: size }}
    >
      {isPin ? <Dog size={size * 0.6} /> : <Cat size={size * 0.6} />}
      
      {/* Mood Decorator for Fallback */}
      {mood === 'eating' && <span className="absolute -bottom-1 -right-1 text-[10px]">🍴</span>}
      {mood === 'sleeping' && <span className="absolute -top-1 -right-1 text-[10px]">💤</span>}
      {mood === 'traveling' && <span className="absolute -bottom-1 -left-1 text-[10px]">🛵</span>}
      {mood === 'shopping' && <span className="absolute -top-1 -left-1 text-[10px]">🛍️</span>}
      {mood === 'shock' && <span className="absolute -top-1 -right-1 text-[10px]">💸</span>}
      {mood === 'happy' && <span className="absolute -top-1 -right-1 text-[10px]">💖</span>}
    </div>
  );
};

export default Sticker;
