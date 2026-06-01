import {atom} from 'jotai';
import {
  colors,
  defaultPromptParts,
  defaultPrompts,
  imageOptions,
} from './consts';
import {
  BoundingBox2DType,
  DetectTypes,
  PointingType,
} from './Types';

export const ImageSrcAtom = atom<string | null>(imageOptions[0]);

export const ImageSentAtom = atom(false);

export const BoundingBoxes2DAtom = atom<BoundingBox2DType[]>([]);

export const PromptsAtom = atom<Record<DetectTypes, string[]>>({
  ...defaultPromptParts,
});
export const CustomPromptsAtom = atom<Record<DetectTypes, string>>({
  ...defaultPrompts,
});

export const RevealOnHoverModeAtom = atom<boolean>(true);

export const PointsAtom = atom<PointingType[]>([]);

export const TemperatureAtom = atom<number>(0.5);

export const DrawModeAtom = atom<boolean>(false);

export const DetectTypeAtom = atom<DetectTypes>('2D bounding boxes');

export const BumpSessionAtom = atom(0);

export const InitFinishedAtom = atom(true);

export const IsUploadedImageAtom = atom(false);

export const RequestJsonAtom = atom('');

export const ResponseJsonAtom = atom('');

export const ActiveColorAtom = atom<string>(colors[0]);

export const LinesAtom = atom<[[number, number][], string][]>([]);

export const HoverEnteredAtom = atom(false);

export const SelectedModelAtom = atom('gemini-robotics-er-1.6-preview');

export const HoveredBoxAtom = atom<number | null>(null);

export const IsLoadingAtom = atom(false);

export const IsThinkingEnabledAtom = atom(false);

export const BoundingBoxes3DAtom = atom<any[]>([]);
export const FovAtom = atom(75);

export const ThemeAtom = atom<'light' | 'dark'>(
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);
