import {useAtom} from 'jotai';
import React from 'react';
import {ActiveColorAtom} from './atoms';
import {colors} from './consts';

export function Palette() {
  const [activeColor, setActiveColor] = useAtom(ActiveColorAtom);
  return (
    <div
      className="flex gap-2 pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}>
      {colors.map((color) => (
        <div
          key={color}
          className="w-7 h-7 rounded-full pointer-events-auto cursor-pointer relative"
          style={{
            background: color === activeColor ? 'transparent' : color,
            border: color === activeColor ? '1px solid ' + color : 'none',
            width: 24,
            height: 24,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveColor(color);
          }}>
          <div
            className="w-5 h-5 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 18,
              height: 18,
              background: color,
            }}
          />
        </div>
      ))}
    </div>
  );
}
