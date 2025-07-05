import React from 'react';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  DocumentIcon,
  MusicalNoteIcon,
  FilmIcon,
  PhotoIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'doc'
  | 'pdf'
  | 'json'
  | 'zip';

export interface LoadingStateProps {
  /** Special chat bubble placeholder */
  type?: 'bubble';
  /** If not a bubble, which file skeleton? */
  fileKind?: FileKind;
}


const iconMap: Record<FileKind, React.ReactNode> = {
  image: <PhotoIcon className="w-8 h-8 text-gray-300" />,
  video: <FilmIcon className="w-8 h-8 text-gray-300" />,
  audio: <MusicalNoteIcon className="w-8 h-8 text-gray-300" />,
  doc: <DocumentIcon className="w-8 h-8 text-gray-300" />,
  pdf: <DocumentIcon className="w-8 h-8 text-gray-300" />, // same glyph, different label
  json: <CodeBracketIcon className="w-8 h-8 text-gray-300" />,
  zip: <ArchiveBoxIcon className="w-8 h-8 text-gray-300" />,
};

/* Re-usable one-liner helpers */
const CenterWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full min-h-screen flex justify-center items-center p-4">
    {children}
  </div>
);

const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  fileKind,
}) => {
  /* ─────────────────────────  CHAT BUBBLE  ───────────────────────── */
  if (type === 'bubble')
     {
    return (
      <CenterWrap>
        <div className="w-[360px] mx-auto p-6">
          <Skeleton height={20} width={200} className="mb-4" />
          <Skeleton height={300} className="rounded-2xl" />
          <div className="mt-4 flex gap-2">
            <Skeleton circle height={40} width={40} />
            <Skeleton circle height={40} width={40} />
            <Skeleton circle height={40} width={40} />
          </div>
        </div>
      </CenterWrap>
    );
  }

/* ─────────────────────────  FILE PLACEHOLDERS  ──────────────────── */
const baseWidth = 360; // tweak to taste
switch (fileKind) {
  case 'image':
    return (
      <CenterWrap>
        <Skeleton
          className="rounded-lg"
          style={{ width: baseWidth, aspectRatio: '4 / 3' }}
        />
      </CenterWrap>
    );

  case 'video':
    return (
      <CenterWrap>
        <div className="space-y-3">
          <Skeleton
            className="rounded-lg"
            style={{ width: baseWidth, aspectRatio: '16 / 9' }}
          />
          {/* faux controls */}
          <div className="flex items-center gap-2">
            <Skeleton circle width={28} height={28} />
            <Skeleton height={6} width="70%" />
            <Skeleton height={6} width="10%" />
          </div>
        </div>
      </CenterWrap>
    );

  case 'audio':
    return (
      <CenterWrap>
        <div className="w-[360px] flex items-center gap-3">
          <Skeleton circle width={32} height={32} />
          {/* waveform bars */}
          <div className="flex-1 flex gap-1 items-end h-12">
            {Array.from({ length: 20 }).map((_, idx) => (
              <Skeleton
                key={idx}
                width={3}
                height={Math.random() * 40 + 8}
                className="rounded-full"
              />
            ))}
          </div>
        </div>
      </CenterWrap>
    );

  case 'doc':
    return (
      <CenterWrap>
        <div className="flex w-[360px] gap-4 items-start">
          {iconMap.doc}
          <div className="flex-1 space-y-2">
            <Skeleton height={12} width="80%" />
            <Skeleton height={12} width="60%" />
            <Skeleton height={12} width="70%" />
          </div>
        </div>
      </CenterWrap>
    );

  case 'pdf':
    return (
      <CenterWrap>
        <div className="flex w-[360px] gap-4 items-start">
          {iconMap.pdf}
          <div className="flex-1 space-y-2">
            <Skeleton height={12} width="85%" />
            <Skeleton height={12} width="65%" />
            <Skeleton height={12} width="75%" />
            <Skeleton height={12} width="50%" />
          </div>
        </div>
      </CenterWrap>
    );

  case 'json':
    return (
      <CenterWrap>
        <div className="flex w-[360px] gap-4 items-start">
          {iconMap.json}
          <div className="flex-1 space-y-2">
            <Skeleton height={12} width="90%" />
            <Skeleton height={12} width="70%" />
            <Skeleton height={12} width="80%" />
            <Skeleton height={12} width="60%" />
            <Skeleton height={12} width="75%" />
          </div>
        </div>
      </CenterWrap>
    );

  case 'zip':
    return (
      <CenterWrap>
        <div className="flex flex-col items-center space-y-2">
          {iconMap.zip}
          <Skeleton height={12} width={80} />
        </div>
      </CenterWrap>
    );

  default:
    return (
      <CenterWrap>
        <Skeleton width={baseWidth} height={120} className="rounded-md" />
      </CenterWrap>
    );
}
};

export default LoadingState;