import { useState } from 'react';
import { Play, ExternalLink, X } from 'lucide-react';

export function extractYouTubeId(url = '') {
  if (!url || typeof url !== 'string') return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch) return shortMatch[1];
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];
  return null;
}

export function extractPlaylistId(url = '') {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

export default function YouTubeCard({ url, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeId(url);
  const playlistId = extractPlaylistId(url);

  if (!videoId && !playlistId) {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-2.5 py-1 rounded-md text-xs font-semibold no-underline transition-colors my-1'
      >
        <span>▶️</span>
        <span>{title || url}</span>
        <ExternalLink size={14} className='ml-0.5' />
      </a>
    );
  }

  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd';

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`;

  const displayTitle = title || 'วิดีโอสาธิตท่าออกกำลังกาย';

  return (
    <div className='bg-zinc-900/90 border border-white/10 rounded-xl overflow-hidden shadow-lg hover:border-red-500/40 hover:-translate-y-0.5 transition-all flex flex-col'>
      {isPlaying ? (
        <div className='flex flex-col w-full bg-zinc-950'>
          <div className='flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10'>
            <span className='text-xs font-semibold text-zinc-200 truncate max-w-[80%]'>{displayTitle}</span>
            <button
              type='button'
              className='flex items-center gap-1 bg-transparent border border-white/15 text-zinc-400 hover:text-white hover:bg-white/10 rounded px-2 py-0.5 text-xs transition-colors cursor-pointer'
              onClick={() => setIsPlaying(false)}
              title='ปิดวิดีโอ'
            >
              <X size={16} />
              <span>ปิด</span>
            </button>
          </div>
          <div className='relative w-full aspect-video'>
            <iframe
              src={embedUrl}
              title={displayTitle}
              className='absolute inset-0 w-full h-full border-0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className='flex flex-col h-full cursor-pointer group' onClick={() => setIsPlaying(true)}>
          <div
            className='relative w-full aspect-video bg-cover bg-center flex items-center justify-center overflow-hidden'
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          >
            <div className='absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 group-hover:from-black/10 group-hover:to-black/50 transition-colors' />
            <button
              type='button'
              className='relative z-10 w-12 h-12 rounded-full bg-red-600 border-0 flex items-center justify-center pl-0.5 cursor-pointer shadow-lg shadow-red-600/40 group-hover:scale-110 group-hover:bg-red-700 transition-all'
              title='กดเพื่อเล่นวิดีโอ'
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
              }}
            >
              <Play size={22} fill='#ffffff' color='#ffffff' />
            </button>
            <div className='absolute top-2 right-2 z-10 bg-black/80 text-red-500 text-[11px] font-bold px-2 py-0.5 rounded tracking-wide'>
              YouTube
            </div>
          </div>
          <div className='p-3 flex flex-col gap-2 flex-1 justify-between'>
            <strong className='text-xs font-semibold text-zinc-100 leading-snug line-clamp-2'>{displayTitle}</strong>
            <div className='flex items-center gap-2 mt-auto'>
              <button
                type='button'
                className='flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white border-0 rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
              >
                <Play size={13} fill='currentColor' />
                <span>ดูในแชท</span>
              </button>
              <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white border border-white/10 rounded-md px-2 py-1 text-xs font-medium no-underline transition-colors'
                onClick={(e) => e.stopPropagation()}
                title='เปิดดูใน YouTube (แท็บใหม่)'
              >
                <span>เปิดบน YouTube</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}