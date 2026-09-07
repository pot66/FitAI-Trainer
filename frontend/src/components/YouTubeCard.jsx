import { useState } from "react";
import { Play, ExternalLink, X } from "lucide-react";

export function extractYouTubeId(url = "") {
  if (!url || typeof url !== "string") return null;

  // Short URL: youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch) return shortMatch[1];

  // Standard URL: youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // Embed URL: youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  // Shorts: youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  return null;
}

export function extractPlaylistId(url = "") {
  if (!url || typeof url !== "string") return null;
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
        target="_blank"
        rel="noopener noreferrer"
        className="yt-simple-link"
      >
        <span className="yt-icon-badge">▶️</span>
        <span>{title || url}</span>
        <ExternalLink size={14} className="yt-ext-icon" />
      </a>
    );
  }

  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80`;

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`;

  const displayTitle = title || "วิดีโอสาธิตท่าออกกำลังกาย";

  return (
    <div className="yt-card">
      {isPlaying ? (
        <div className="yt-embed-wrapper">
          <div className="yt-embed-header">
            <span className="yt-embed-title">{displayTitle}</span>
            <button
              type="button"
              className="yt-close-btn"
              onClick={() => setIsPlaying(false)}
              title="ปิดวิดีโอ"
            >
              <X size={16} />
              <span>ปิด</span>
            </button>
          </div>
          <div className="yt-iframe-container">
            <iframe
              src={embedUrl}
              title={displayTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="yt-preview" onClick={() => setIsPlaying(true)}>
          <div
            className="yt-thumb"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          >
            <div className="yt-thumb-overlay" />
            <button
              type="button"
              className="yt-play-btn"
              title="กดเพื่อเล่นวิดีโอ"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
              }}
            >
              <Play size={22} fill="#ffffff" color="#ffffff" />
            </button>
            <div className="yt-badge">YouTube</div>
          </div>
          <div className="yt-info">
            <strong className="yt-title">{displayTitle}</strong>
            <div className="yt-actions">
              <button
                type="button"
                className="yt-action-play"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
              >
                <Play size={13} fill="currentColor" />
                <span>ดูในแชท</span>
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="yt-action-ext"
                onClick={(e) => e.stopPropagation()}
                title="เปิดดูใน YouTube (แท็บใหม่)"
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
