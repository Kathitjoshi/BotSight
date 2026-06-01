import {useAtom} from 'jotai';
import React from 'react';
import {DrawModeAtom, LinesAtom} from './atoms';
import {Palette} from './Palette';
import {Trash2, Check, Info} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';

export function ExtraModeControls() {
  const [drawMode, setDrawMode] = useAtom(DrawModeAtom);
  const [, setLines] = useAtom(LinesAtom);

  return (
    <AnimatePresence>
      {drawMode ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col sm:flex-row gap-3.5 p-4 bg-[var(--box-color)] border border-[var(--border-color)] rounded-xl mt-3 items-center justify-between shadow-sm z-20"
        >
          {/* Info Badge */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-color-secondary)] uppercase">
            <Info className="w-4 h-4 text-[var(--accent-color)]" />
            <span>Brush Tool active: Paint hints on image</span>
          </div>

          {/* Color Pallettes */}
          <div className="grow flex justify-center py-1">
            <Palette />
          </div>

          {/* Actions Button Bar */}
          <div className="flex gap-2.5 shrink-0">
            {/* Clear Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-lg border border-[var(--border-color)] bg-transparent text-[var(--text-color-primary)] hover:border-red-500 hover:bg-red-500/5 cursor-pointer transition-colors"
              onClick={() => {
                setLines([]);
              }}
              style={{ minHeight: '0' }}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Canvas</span>
            </motion.button>

            {/* Done Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-lg bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/90 cursor-pointer transition-colors"
              onClick={() => {
                setDrawMode(false);
              }}
              style={{ minHeight: '0' }}
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Finish Frame</span>
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
