import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useAuth } from '../../auth';

export interface NotFoundViewProps {
  isPreview?: boolean;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ isPreview = false }) => {
  const { user } = useAuth();
  const isAuthOrPreview = isPreview || Boolean(user);
  const workspacePath = isPreview ? '/preview' : '/workspace';

  return (
    <div
      data-testid="not-found-view"
      className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden"
    >
      <style>{`
        @keyframes headTilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-7deg); }
          75% { transform: rotate(7deg); }
        }
        @keyframes eyesLook {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-12px) rotate(7deg); }
        }
        @keyframes questionBlink {
          0%, 100% { opacity: 0.35; transform: scale(0.9) translateY(0); }
          50% { opacity: 1; transform: scale(1.15) translateY(-6px); }
        }
        .vido-head-tilt {
          animation: headTilt 3.8s ease-in-out infinite;
          transform-origin: 100px 92px;
        }
        .vido-eyes-look {
          animation: eyesLook 3.8s ease-in-out infinite;
        }
        .vido-float-1 {
          animation: floatCard1 4s ease-in-out infinite;
        }
        .vido-float-2 {
          animation: floatCard2 4.8s ease-in-out infinite;
        }
        .vido-question-pulse {
          animation: questionBlink 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Brand Header Mark */}
      <Link
        to="/"
        className="flex items-center gap-2.5 mb-8 hover:opacity-85 transition-opacity cursor-pointer"
        aria-label="ViDo Home"
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--dark)] text-white flex items-center justify-center font-black text-base shadow-sm">
          V
        </div>
        <span className="font-bold text-lg tracking-tight text-[var(--ink)]">ViDo</span>
      </Link>

      {/* Animated Character Looking for Tasks */}
      <div
        data-testid="animated-character"
        className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center mb-6"
      >
        <svg
          viewBox="0 0 240 210"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Ambient Glow */}
          <circle cx="120" cy="110" r="85" fill="var(--accent)" fillOpacity="0.06" />

          {/* Floating Empty Task Card 1 (Left) */}
          <g className="vido-float-1">
            <rect
              x="18"
              y="50"
              width="58"
              height="40"
              rx="8"
              fill="var(--surface)"
              stroke="var(--line)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect x="25" y="60" width="8" height="8" rx="2" stroke="var(--faint)" strokeWidth="1.2" />
            <line x1="38" y1="64" x2="66" y2="64" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="76" x2="56" y2="76" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Floating Empty Task Card 2 (Right) */}
          <g className="vido-float-2">
            <rect
              x="166"
              y="38"
              width="58"
              height="40"
              rx="8"
              fill="var(--surface)"
              stroke="var(--line)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect x="173" y="48" width="8" height="8" rx="2" stroke="var(--faint)" strokeWidth="1.2" />
            <line x1="186" y1="52" x2="214" y2="52" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" />
            <line x1="173" y1="64" x2="204" y2="64" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Pulsing Question Mark above character */}
          <g className="vido-question-pulse" style={{ transformOrigin: '120px 24px' }}>
            <circle cx="120" cy="24" width="24" height="24" r="13" fill="var(--accent-soft)" />
            <text
              x="120"
              y="30"
              textAnchor="middle"
              fill="var(--accent)"
              fontSize="16"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              ?
            </text>
          </g>

          {/* Character Body & Clothing */}
          {/* Torso / Jacket */}
          <path
            d="M92 128 C92 112 104 104 120 104 C136 104 148 112 148 128 L152 178 C152 182 148 185 144 185 L96 185 C92 185 88 182 88 178 Z"
            fill="var(--dark)"
          />
          {/* Accent collar detail */}
          <path d="M112 104 L120 120 L128 104 Z" fill="var(--accent)" />

          {/* Left Arm holding clipboard */}
          <path
            d="M93 118 L76 138 C74 140 76 144 80 144 L92 144"
            stroke="var(--dark)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Empty Clipboard held by character */}
          <rect
            x="54"
            y="126"
            width="34"
            height="46"
            rx="5"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          <rect x="65" y="123" width="12" height="4" rx="2" fill="var(--faint)" />
          {/* Dashed missing task lines on clipboard */}
          <line x1="60" y1="138" x2="80" y2="138" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="60" y1="146" x2="82" y2="146" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="60" y1="154" x2="74" y2="154" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="60" y1="162" x2="78" y2="162" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Right Arm: Scratching head in puzzlement */}
          <path
            d="M147 118 L162 108 C165 106 168 109 166 113 L152 135"
            stroke="var(--dark)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Hand scratching head */}
          <circle cx="163" cy="98" r="4.5" fill="#fbcfe8" />

          {/* Tilting Head Group */}
          <g className="vido-head-tilt">
            {/* Neck */}
            <rect x="115" y="92" width="10" height="15" fill="#fbcfe8" rx="2" />

            {/* Head Base */}
            <circle cx="120" cy="74" r="22" fill="#fbcfe8" />

            {/* Stylish Hair */}
            <path
              d="M98 70 C98 56 108 48 122 48 C136 48 144 54 144 68 C144 72 140 73 138 67 C134 56 122 55 116 57 C108 59 104 66 102 73 Z"
              fill="var(--ink)"
            />

            {/* Inquisitive Eyebrows */}
            <path d="M110 65 Q114 62 118 66" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M124 66 Q128 62 132 65" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Eyes looking around */}
            <g className="vido-eyes-look">
              {/* Eye whites */}
              <circle cx="114" cy="72" r="3" fill="#ffffff" />
              <circle cx="128" cy="72" r="3" fill="#ffffff" />
              {/* Pupils */}
              <circle cx="114" cy="72" r="1.5" fill="var(--ink)" />
              <circle cx="128" cy="72" r="1.5" fill="var(--ink)" />
            </g>

            {/* Curious / Slightly Puzzled Smile */}
            <path
              d="M117 84 Q121 87 125 84"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Floor Shadow Base */}
          <ellipse cx="120" cy="195" rx="45" ry="6" fill="var(--line)" fillOpacity="0.45" />
        </svg>
      </div>

      {/* Calm & Reassuring Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] max-w-lg">
        You&apos;ve wandered off the scheduled horizon
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-[var(--muted)] max-w-md mx-auto mt-2 leading-relaxed">
        There are no tasks, events, or milestones located here. Let&apos;s guide you back to your workspace.
      </p>

      {/* Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {isAuthOrPreview && (
          <Link to={workspacePath} tabIndex={-1}>
            <Button variant="primary" size="md" className="gap-2 shadow-md">
              <ArrowLeft className="w-4 h-4" />
              Back to Workspace
            </Button>
          </Link>
        )}

        <Link to="/" tabIndex={-1}>
          <Button variant="secondary" size="md" className="gap-2 shadow-xs">
            <Home className="w-4 h-4 text-[var(--muted)]" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
