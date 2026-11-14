"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A photograph's frame that still reads as designed when the photograph
 * doesn't arrive.
 *
 * The frame itself is the stand-in: an ink-tinted block carrying the logo
 * mark, painted from the first byte of HTML. The picture is layered on top
 * and covers it once it loads. If it fails — a dead pasted URL, a bucket
 * outage, a blocked CDN — the `<img>` is hidden so no browser can draw its
 * broken-image glyph or alt text over the block, and the mark shows through.
 *
 * Failure is read off the element rather than from `onError` alone, because
 * an image that fails before hydration has already fired its error event by
 * the time React can listen for it.
 */
export function PhotoFrame({
  children,
  className = "",
}: {
  /** The picture, absolutely positioned to fill the frame. */
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current?.querySelector("img");
    if (!img) return;

    // `complete` with no intrinsic width is how a failed load presents once
    // it has settled — including the case where it failed before hydration.
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) {
      setFailed(true);
      return;
    }

    const onError = () => setFailed(true);
    img.addEventListener("error", onError);
    return () => img.removeEventListener("error", onError);
  }, []);

  return (
    <div
      ref={ref}
      data-photo-failed={failed ? "" : undefined}
      className={`relative overflow-hidden bg-white/[0.06] [&[data-photo-failed]_img]:invisible ${className}`}
    >
      <LogoMark className="absolute top-1/2 left-1/2 w-[28%] max-w-[140px] -translate-x-1/2 -translate-y-1/2 text-mist/25" />
      {children}
    </div>
  );
}

/** The leaf mark from `src/app/icon.svg`, in one colour so it sits quietly. */
function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-6.1 -103.9 660 660"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={className}
    >
      <path d="M424,183.16c-22.83,30.68-40.35,62.49-46.71,100.78-8.63,51.96,2.54,113.3,28.19,159.23.82,1.47,6.11,8.35,5.51,8.98-19.31-11.22-40.64-19.8-62.78-23.71-35.94-6.35-72.21.81-103.87,18.55-2.86,1.6-4.4,4.36-7.34,4.15,15.24-28,27.52-59.11,32.71-90.78,10.81-65.96-5.67-126.89-47.71-178.2,11.19,2.35,21.73,6.79,32.78,9.71,43.21,11.38,85.8,11.55,129.42,1.99,13.42-2.94,26.31-8.02,39.79-10.7Z" />
      <path d="M637.99,143.15c4.71,43.95-5.06,91.89-29.58,128.92-43.64,65.91-129.18,73.55-183.41,127.08,3.05-19.78,16.47-40,29.48-55.01,27.86-32.17,73.11-51.27,96.33-83.67,1.92-2.68,7.51-11.15,8.14-13.87.35-1.53.05-1.66-1.43-1.43-55.94,29.01-109.53,69.04-142.02,123.99-3.85-.14,6.27-39.52,7.23-42.78,14.14-47.56,46.66-91.7,87.96-119.04,35.63-23.59,78.68-29.88,113.64-54.36,3.48-2.44,7.6-7.14,10.74-9.13,1.09-.69,1.48-.98,2.93-.7Z" />
      <path d="M233.99,370.15l-17.57-25.91c-33.22-42.85-77.88-75.42-126.93-98.07-.65,3.1,3.22,8.05,5.09,10.91,21.6,33.02,68.25,52.91,95.93,84.07,14.08,15.85,27.23,36.46,32.48,57.01-9.57-6.46-18.08-14.38-27.67-20.82-39.68-26.63-87.37-40.75-124.79-71.21C23.06,267.48,2.69,205.17,10.01,145.16l19.69,12.8c28.45,16.66,61.06,24.14,89.97,40.03,62.34,34.26,107.22,101.16,114.32,172.17Z" />
      <path d="M536.99,1.15c9.38,21.49,18.46,43.76,20,67.51,6.52,100.29-69.2,116.21-125.96,177.02l-19.02,28.47c.79-38.19,21.22-72.11,45.02-100.47,10.94-13.04,48-47.55,46.93-63.97-.35-5.44-5.02-8.38-10.22-7.35-9.1,1.81-46.31,32.96-57.61,40.42-12.41,8.2-25.49,15.44-38.64,22.36.21-3.96,2.06-8.77,3.48-12.52,26.02-68.76,94.32-93.14,133.8-150.17.61-.88-.16-1.85,2.22-1.3Z" />
      <path d="M111.99.15c-.04,1.26.27,2.46.95,3.52,34.79,54.16,99.47,76.63,128.56,139.48,2.05,4.43,6.39,15.09,7.45,19.56.36,1.53.04,1.65-1.43,1.42-11.47-6.92-23.44-12.99-34.65-20.36-13.12-8.63-47.79-38.67-59.81-41.19-9.42-1.97-11.97,5.74-9.57,13.58,5.63,18.39,39.19,48.03,52.48,64.51,22.02,27.28,37.88,57.77,40.02,93.47-6.03-8.75-11.32-18.18-18.01-26.48-39.92-49.5-103.53-64.69-123.48-131.52-10.28-34.43-4.62-84.28,15.26-114.71.63-.96-.11-1.79,2.23-1.29Z" />
      <path d="M320.81,47.44c23.88-1.28,47.44,15.27,54.47,37.93,16.08,51.77-44.21,97.48-87.29,60.29-37.74-32.57-17.14-95.54,32.82-98.22Z" />
    </svg>
  );
}
