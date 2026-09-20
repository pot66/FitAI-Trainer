import { useMemo, useState } from "react";
import YouTubeCard, { extractYouTubeId, extractPlaylistId } from "./YouTubeCard";

function renderBoldText(text, keyPrefix = "bold") {
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
      <strong key={`${keyPrefix}-${match.index}`} className="font-bold text-zinc-100">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex === 0) {
    return text;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
}

function renderInlineMarkdown(text) {
  if (!text) return null;
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const segment = text.substring(lastIndex, match.index);
      const boldParts = renderBoldText(segment, `link-pre-${lastIndex}`);
      if (Array.isArray(boldParts)) {
        parts.push(...boldParts);
      } else if (boldParts) {
        parts.push(boldParts);
      }
    }
    const [, linkTitle, linkUrl] = match;
    const isYouTube = extractYouTubeId(linkUrl) || extractPlaylistId(linkUrl);
    parts.push(
      <a
        key={"link-" + match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={
          isYouTube
            ? "inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500 rounded px-2 py-0.5 font-semibold text-xs transition-all my-0.5"
            : "text-sky-400 underline underline-offset-2 hover:text-sky-300"
        }
      >
        {isYouTube && <span className="text-xs">&#9651; </span>}
        {linkTitle}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) {
    return renderBoldText(text, "plain");
  }

  if (lastIndex < text.length) {
    const segment = text.substring(lastIndex);
    const boldParts = renderBoldText(segment, `link-post-${lastIndex}`);
    if (Array.isArray(boldParts)) {
      parts.push(...boldParts);
    } else if (boldParts) {
      parts.push(boldParts);
    }
  }
  return parts;
}

export default function ChatMessageContent({ content, onLogFood }) {
  const [isLogged, setIsLogged] = useState(false);

  const { lines, youtubeVideos, foodActionData } = useMemo(() => {
    if (!content || typeof content !== "string") {
      return { lines: [], youtubeVideos: [], foodActionData: null };
    }

    let foodAction = null;
    let cleanContent = content;
    const foodMatch = content.match(/\[LOG_FOOD_ACTION:([\s\S]*?)\]/);
    if (foodMatch) {
      try {
        foodAction = JSON.parse(foodMatch[1]);
        cleanContent = content.replace(/\[LOG_FOOD_ACTION:[\s\S]*?\]/, "").trim();
      } catch (e) {
        console.warn("Could not parse food action json:", e);
      }
    }

    const rawLines = cleanContent.split("\n");
    const foundVideos = [];
    const seenUrls = new Set();
    const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let mdMatch;
    while ((mdMatch = mdLinkRegex.exec(cleanContent)) !== null) {
      const [, title, url] = mdMatch;
      if (
        (extractYouTubeId(url) || extractPlaylistId(url)) &&
        !seenUrls.has(url)
      ) {
        seenUrls.add(url);
        foundVideos.push({ url, title });
      }
    }
    const rawYtRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s)>\]]+)/g;
    let rawMatch;
    while ((rawMatch = rawYtRegex.exec(cleanContent)) !== null) {
      const url = rawMatch[1];
      if (
        (extractYouTubeId(url) || extractPlaylistId(url)) &&
        !seenUrls.has(url)
      ) {
        seenUrls.add(url);
        foundVideos.push({ url, title: "วิดีโอสาธิตการออกกำลังกาย" });
      }
    }
    return { lines: rawLines, youtubeVideos: foundVideos, foodActionData: foodAction };
  }, [content]);

  return (
    <div className="flex flex-col gap-2 w-full text-sm leading-relaxed">
      <div className="text-[14.5px] leading-relaxed text-inherit">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={idx} className="text-base font-semibold mt-2.5 mb-1 text-zinc-100">
                {renderInlineMarkdown(trimmed.substring(4))}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={idx} className="text-base font-bold mt-3 mb-1 text-zinc-100">
                {renderInlineMarkdown(trimmed.substring(3))}
              </h3>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h2 key={idx} className="text-lg font-bold mt-3.5 mb-1 text-zinc-100">
                {renderInlineMarkdown(trimmed.substring(2))}
              </h2>
            );
          }
          if (trimmed === "---") {
            return <hr key={idx} className="border-t border-white/10 my-2.5" />;
          }
          if (/^[-*•]\s+/.test(trimmed)) {
            const bulletText = trimmed.replace(/^[-*•]\s+/, "");
            return (
              <div key={idx} className="flex items-baseline gap-2 my-0.5 pl-1">
                <span className="text-red-500 text-base leading-none">•</span>
                <span className="flex-1">{renderInlineMarkdown(bulletText)}</span>
              </div>
            );
          }
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-baseline gap-2 my-0.5">
                <span className="font-bold text-red-500 min-w-[18px]">{numMatch[1]}.</span>
                <span className="flex-1">{renderInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }
          return (
            <p key={idx} className="my-1 whitespace-pre-wrap break-words">
              {renderInlineMarkdown(line)}
            </p>
          );
        })}
      </div>

      {/* Interactive Food Calorie Action Card */}
      {foodActionData && (
        <div className="mt-2.5 p-3.5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🍽️</span>
              <span className="font-bold text-white text-sm">{foodActionData.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                {foodActionData.calories} kcal
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>🍗 โปรตีน {foodActionData.protein}g</span>
              <span>•</span>
              <span>🍚 คาร์บ {foodActionData.carbs}g</span>
              <span>•</span>
              <span>🥑 ไขมัน {foodActionData.fat}g</span>
            </div>
          </div>
          <button
            type="button"
            disabled={isLogged}
            onClick={() => {
              if (onLogFood) {
                onLogFood(foodActionData);
                setIsLogged(true);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
              isLogged
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                : "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/40"
            }`}
          >
            <span>{isLogged ? "✓" : "+"}</span>
            <span>{isLogged ? "บันทึกเรียบร้อยแล้ว" : "บันทึกลงมื้ออาหาร"}</span>
          </button>
        </div>
      )}

      {youtubeVideos.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2.5">
            <span>🎥 วิดีโอสอนการออกกำลังกาย ({youtubeVideos.length} คลิป)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {youtubeVideos.map((video, vIdx) => (
              <YouTubeCard
                key={video.url + "-" + vIdx}
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
