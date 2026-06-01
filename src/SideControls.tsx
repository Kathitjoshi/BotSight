import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {
  BumpSessionAtom,
  DrawModeAtom,
  ImageSentAtom,
  ImageSrcAtom,
  IsUploadedImageAtom,
} from './atoms';
import {useResetState} from './hooks';
import {UploadCloud, Palette, Paintbrush, FileImage} from 'lucide-react';
import {motion} from 'motion/react';

export function SideControls() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [drawMode, setDrawMode] = useAtom(DrawModeAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const resetState = useResetState();
  const [isDragging, setIsDragging] = useState(false);

  // File loading helper
  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('image/')) || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resetState();
        setImageSrc(e.target?.result as string);
        setIsUploadedImage(true);
        setImageSent(false);
        setBumpSession((prev) => prev + 1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Interactive Drag & Drop Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
            : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/60 hover:bg-[var(--input-color)]'
        }`}
      >
        <input
          id="file-upload-input"
          className="hidden"
          type="file"
          accept=".jpg, .jpeg, .png, .webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <label htmlFor="file-upload-input" className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-1.5 home-upload-zone">
          <UploadCloud className={`w-6 h-6 mb-2 transition-transform duration-200 ${isDragging ? '-translate-y-1 text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)]'}`} />
          <span className="font-mono text-xs font-bold text-[var(--text-color-primary)]">
            {isDragging ? 'Drop Image Here' : 'Upload Image'}
          </span>
          <span className="text-[10px] text-[var(--text-color-secondary)] mt-1 font-mono uppercase">
            Drag-and-drop or click
          </span>
        </label>
      </motion.div>

      {/* Draw Annotation Canvas activator */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          setDrawMode(!drawMode);
        }}
        className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 cursor-pointer font-mono text-xs transition-all ${
          drawMode
            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-bold border-glow'
            : 'border-[var(--border-color)] bg-[var(--box-color)] text-[var(--text-color-primary)] hover:border-[var(--text-color-secondary)]/50'
        }`}
        style={{ minHeight: '0' }}
      >
        <Paintbrush className={`w-4 h-4 ${drawMode ? 'text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)]'}`} />
        <span>{drawMode ? 'Drawing Active' : 'Annotate Scene Frame'}</span>
      </motion.button>
    </div>
  );
}
