import { useMemo } from "react";
import YouTubeCard, { extractYouTubeId, extractPlaylistId } from "./YouTubeCard";

function renderInlineMarkdown(text) {
  if (!text) return null;

  // Split by markdown link pattern [title](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderBoldText(text.substring(lastIndex, match.index)));
    }

    const [, linkTitle, linkUrl] = match;
    const isYouTube = extractYouTubeId(linkUrl) || extractPlaylistId(linkUrl);

    parts.push(
      <a
        key={`link-${match.index}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={isYouTube ? "chat-yt-inline-link" : "chat-normal-link"}
      >
        {isYouTube && <span className="yt-icon-inline">▶️ </span>}
        {linkTitle}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderBoldText(text.substring(lastIndex)));
  }

  return parts;
}

function renderBoldText(text) {
  if (!text) return null;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${match.index}`}>{match[1]}</strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default function ChatMessageContent({ content }) {
  const { lines, youtubeVideos } = useMemo(() => {
    if (!content || typeof content !== "string") {
      return { lines: [], youtubeVideos: [] };
    }

    const rawLines = content.split("\n");
    const foundVideos = [];
    const seenUrls = new Set();

    // 1. Scan for Markdown links: [Title](URL)
    const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let mdMatch;
    while ((mdMatch = mdLinkRegex.exec(content)) !== null) {
      const [, title, url] = mdMatch;
      if (
        (extractYouTubeId(url) || extractPlaylistId(url)) &&
        !seenUrls.has(url)
      ) {
        seenUrls.add(url);
        foundVideos.push({ url, title });
      }
    }

    // 2. Scan for raw YouTube URLs
    const rawYtRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s)>\]]+)/g;
    let rawMatch;
    while ((rawMatch = rawYtRegex.exec(content)) !== null) {
      const url = rawMatch[1];
      if (
        (extractYouTubeId(url) || extractPlaylistId(url)) &&
        !seenUrls.has(url)
      ) {
        seenUrls.add(url);
        foundVideos.push({ url, title: "วิดีโอสาธิตการออกกำลังกาย" });
      }
    }

    return { lines: rawLines, youtubeVideos: foundVideos };
  }, [content]);

  return (
    <div className="chat-message-content">
      <div className="chat-text-body">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="chat-spacer" />;
          }

          // Headers
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={idx} className="chat-h3">
                {renderInlineMarkdown(trimmed.substring(4))}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={idx} className="chat-h2">
                {renderInlineMarkdown(trimmed.substring(3))}
              </h3>
            );
          }

          // Separator
          if (trimmed === "---") {
            return <hr key={idx} className="chat-divider" />;
          }

          // Bullet point
          if (/^[-*•]\s+/.test(trimmed)) {
            const bulletText = trimmed.replace(/^[-*•]\s+/, "");
            return (
              <div key={idx} className="chat-bullet-item">
                <span className="bullet-dot">•</span>
                <span className="bullet-text">{renderInlineMarkdown(bulletText)}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="chat-numbered-item">
                <span className="number-badge">{numMatch[1]}.</span>
                <span className="number-text">{renderInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          // Normal paragraph line
          return (
            <p key={idx} className="chat-paragraph">
              {renderInlineMarkdown(line)}
            </p>
          );
        })}
      </div>

      {/* YouTube Cards Collection */}
      {youtubeVideos.length > 0 && (
        <div className="chat-video-deck">
          <div className="chat-video-deck-header">
            <span>🎥 วิดีโอสอนท่าออกกำลังกาย ({youtubeVideos.length} คลิป)</span>
          </div>
          <div className="chat-video-grid">
            {youtubeVideos.map((video, vIdx) => (
              <YouTubeCard
                key={`${video.url}-${vIdx}`}
                url={video.url}
                title={video.title}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
