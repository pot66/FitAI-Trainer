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
        className='inline-flex items-center gap-1.5 bg-[#c4d7e6] text-[#1e293b] border border-slate-300 hover:bg-[#b0c8dc] px-2.5 py-1 rounded-lg text-xs font-bold no-underline transition-colors my-1'
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
    <div className='bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-[#3b99e2]/50 hover:-translate-y-0.5 transition-all flex flex-col'>
      {isPlaying ? (
        <div className='flex flex-col w-full bg-slate-900'>
          <div className='flex items-center justify-between px-3 py-2 bg-[#abbed2] border-b border-[#9bb0c4]'>
            <span className='text-xs font-bold text-[#1e293b] truncate max-w-[80%]'>{displayTitle}</span>
            <button
              type='button'
              className='flex items-center gap-1 bg-white hover:bg-slate-100 text-[#1e293b] border border-white/60 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer'
              onClick={() => setIsPlaying(false)}
              title='ปิดวิดีโอ'
            >
              <X size={14} />
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
            <div className='absolute inset-0 bg-gradient-to-b from-black/10 to-black/60 group-hover:from-black/10 group-hover:to-black/40 transition-colors' />
            <button
              type='button'
              className='relative z-10 w-12 h-12 rounded-full bg-[#3b99e2] border-0 flex items-center justify-center pl-0.5 cursor-pointer shadow-lg shadow-[#3b99e2]/40 group-hover:scale-110 group-hover:bg-[#288ad4] transition-all'
              title='กดเพื่อเล่นวิดีโอ'
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
              }}
            >
              <Play size={20} fill='#ffffff' color='#ffffff' />
            </button>
            <div className='absolute top-2 right-2 z-10 bg-white/90 text-[#1e293b] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide'>
              YouTube
            </div>
          </div>
          <div className='p-3.5 flex flex-col gap-2.5 flex-1 justify-between bg-white'>
            <strong className='text-xs font-bold text-[#1e293b] leading-snug line-clamp-2'>{displayTitle}</strong>
            <div className='flex items-center gap-2 mt-auto'>
              <button
                type='button'
                className='flex items-center gap-1 bg-[#3b99e2] hover:bg-[#288ad4] text-white border-0 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-[#3b99e2]/25'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
              >
                <Play size={12} fill='currentColor' />
                <span>ดูในแชท</span>
              </button>
              <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 bg-[#edf1f4] hover:bg-[#e2e8f0] text-[#1e293b] border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold no-underline transition-colors'
                onClick={(e) => e.stopPropagation()}
                title='เปิดดูใน YouTube (แท็บใหม่)'
              >
                <span>เปิดบน YouTube</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
