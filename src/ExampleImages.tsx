import {useAtom} from 'jotai';
import React from 'react';
import {ImageSrcAtom, IsUploadedImageAtom} from './atoms';
import {imageOptions} from './consts';
import {useResetState} from './hooks';
import {motion} from 'motion/react';

export function ExampleImages() {
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const resetState = useResetState();

  // Extract a readable name from URL for descriptive tooltips
  const getImageName = (url: string) => {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename
        .replace('.png', '')
        .replace('.jpg', '')
        .replace('.jpeg', '')
        .split('-')
        .join(' ')
        .split('_')
        .join(' ');
    } catch {
      return 'Scene';
    }
  };

  return (
    <div className="grid grid-cols-4 lg:grid-cols-3 gap-2.5 w-full">
      {imageOptions.map((image) => {
        const isSelected = imageSrc === image;
        const name = getImageName(image);
        
        return (
          <motion.button
            key={image}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={name}
            className={`p-0 aspect-square relative overflow-hidden rounded-lg border-2 bg-[var(--input-color)] cursor-pointer transition-all ${
              isSelected
                ? 'border-[var(--accent-color)] shadow-md shadow-[var(--accent-color)]/10'
                : 'border-transparent hover:border-[var(--text-color-secondary)]/50'
            }`}
            onClick={() => {
              setIsUploadedImage(false);
              setImageSrc(image);
              resetState();
            }}
            style={{ minHeight: '0' }}
          >
            <img
              src={image}
              alt={name}
              referrerPolicy="no-referrer"
              className="absolute left-0 top-0 w-full h-full object-cover"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-[var(--accent-color)]/15 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
