import {useAtom} from 'jotai';
import React from 'react';
import {DetectTypeAtom, HoverEnteredAtom, RevealOnHoverModeAtom, ThemeAtom} from './atoms';
import {useResetState} from './hooks';
import {Cpu, RotateCcw, Sun, Moon, Eye, EyeOff} from 'lucide-react';
import {motion} from 'motion/react';

export function TopBar() {
  const resetState = useResetState();
  const [revealOnHover, setRevealOnHoverMode] = useAtom(RevealOnHoverModeAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [theme, setTheme] = useAtom(ThemeAtom);

  return (
    <header className="flex w-full items-center px-6 py-4 border-b border-[var(--border-color)] bg-[var(--input-color)] justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg text-[var(--accent-color)]">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-sm text-[var(--text-color-primary)]">
              Robotics Spatial Engine
            </span>
            <span className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">
              v1.6-ER
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-color-secondary)] uppercase">
            Computer Vision Telemetry Interface
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {/* Reset Session Action */}
        <button
          onClick={resetState}
          className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-transparent hover:border-[var(--accent-color)] transition-all cursor-pointer text-[var(--text-color-primary)]"
          style={{ minHeight: '0' }}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--text-color-secondary)]" />
          <span>Reset Core</span>
        </button>

        {/* Reveal on Hover Config (Conditional) */}
        {detectType === '2D bounding boxes' && (
          <div className="border-r border-[var(--border-color)] pr-4 h-5 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono uppercase">
              <input
                type="checkbox"
                checked={revealOnHover}
                onChange={(e) => {
                  if (e.target.checked) {
                    setHoverEntered(false);
                  }
                  setRevealOnHoverMode(e.target.checked);
                }}
                className="w-3.5 h-3.5 accent-[var(--accent-color)] rounded border-[var(--border-color)]"
              />
              <span className="text-[var(--text-color-primary)] flex items-center gap-1">
                {revealOnHover ? (
                  <>
                    <Eye className="w-3.5 h-3.5 inline text-[var(--accent-color)]" />
                    Hover Reveal
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 inline text-[var(--text-color-secondary)]" />
                    Reveal All
                  </>
                )}
              </span>
            </label>
          </div>
        )}

        {/* Theme Switcher Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="bg-transparent flex items-center justify-center p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all text-[var(--text-color-primary)] cursor-pointer"
          style={{ width: '32px', height: '32px', minHeight: '0' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>
    </header>
  );
}
