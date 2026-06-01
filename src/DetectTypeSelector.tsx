import {useAtom} from 'jotai';
import React from 'react';
import {DetectTypeAtom, HoverEnteredAtom} from './atoms';
import {DetectTypes} from './Types';
import {Target, Crosshair} from 'lucide-react';
import {motion} from 'motion/react';

export function DetectTypeSelector() {
  return (
    <div className="flex flex-col gap-3 shrink-0">
      <span className="text-xs font-mono text-[var(--text-color-secondary)] uppercase">
        Detection Mode
      </span>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        <SelectOption label="2D bounding boxes" title="Bounding Boxes" description="Identify object boundaries" Icon={Target} />
        <SelectOption label="Points" title="Points (Coordinates)" description="Map normalized pinpoint points" Icon={Crosshair} />
      </div>
    </div>
  );
}

interface SelectOptionProps {
  label: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{className?: string}>;
}

const SelectOption: React.FC<SelectOptionProps> = ({label, title, description, Icon}) => {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const isSelected = detectType === label;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => {
        setHoverEntered(false);
        setDetectType(label as DetectTypes);
      }}
      className={`text-left p-4 rounded-xl border flex gap-3.5 items-start cursor-pointer transition-all duration-250 ${
        isSelected
          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5 border-glow'
          : 'border-[var(--border-color)] bg-[var(--box-color)] hover:border-[var(--text-color-secondary)]/55'
      }`}
      style={{ minHeight: '0' }}
    >
      <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
        isSelected ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--input-color)] text-[var(--text-color-secondary)]'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="font-mono text-xs font-bold uppercase tracking-wide text-[var(--text-color-primary)]">
          {title}
        </div>
        <div className="text-[11px] text-[var(--text-color-secondary)] mt-1.5 leading-normal">
          {description}
        </div>
      </div>
    </motion.button>
  );
};
