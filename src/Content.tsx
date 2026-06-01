import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  ActiveColorAtom,
  BoundingBoxes2DAtom,
  DetectTypeAtom,
  DrawModeAtom,
  ImageSentAtom,
  ImageSrcAtom,
  LinesAtom,
  PointsAtom,
  RevealOnHoverModeAtom,
} from './atoms';
import {lineOptions} from './consts';
import {getSvgPathFromStroke} from './utils';
import {motion} from 'motion/react';

export function Content() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [points] = useAtom(PointsAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [hoverEntered, setHoverEntered] = useState(false);
  const [hoveredBox, _setHoveredBox] = useState<number | null>(null);
  const [drawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [activeColor] = useAtom(ActiveColorAtom);

  const boundingBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({
    width: 0,
    height: 0,
  });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({
    width: 1,
    height: 1,
  });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({
        width: el.width,
        height: el.height,
      });
    }
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  function setHoveredBox(e: React.PointerEvent) {
    const boxes = document.querySelectorAll('.bbox');
    const dimensionsAndIndex = Array.from(boxes).map((box, i) => {
      const {top, left, width, height} = box.getBoundingClientRect();
      return {
        top,
        left,
        width,
        height,
        index: i,
      };
    });

    // Sort smallest to largest
    const sorted = dimensionsAndIndex.sort(
      (a, b) => a.width * a.height - b.width * b.height,
    );

    // Find the smallest box that contains the mouse
    const {clientX, clientY} = e;
    const found = sorted.find(({top, left, width, height}) => {
      return (
        clientX > left &&
        clientX < left + width &&
        clientY > top &&
        clientY < top + height
      );
    });
    if (found) {
      _setHoveredBox(found.index);
    } else {
      _setHoveredBox(null);
    }
  }

  const downRef = useRef<Boolean>(false);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {imageSrc ? (
        <img
          src={imageSrc}
          className="absolute max-w-full max-h-full object-contain rounded-lg shadow-inner"
          alt="Active Vision Stage"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onLoad={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}
      
      <div
        className={`absolute max-w-full max-h-full select-none ${hoverEntered ? 'hide-box' : ''} ${drawMode ? 'cursor-crosshair' : ''}`}
        ref={boundingBoxContainerRef}
        onPointerEnter={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
        }}
        onPointerMove={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            setHoveredBox(e);
          }
          if (downRef.current) {
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev.slice(0, prev.length - 1),
              [
                [
                  ...prev[prev.length - 1][0],
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                prev[prev.length - 1][1],
              ],
            ]);
          }
        }}
        onPointerLeave={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(false);
            setHoveredBox(e);
          }
        }}
        onPointerDown={(e) => {
          if (drawMode) {
            setImageSent(false);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downRef.current = true;
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev,
              [
                [
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                activeColor,
              ],
            ]);
          }
        }}
        onPointerUp={(e) => {
          if (drawMode) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            downRef.current = false;
          }
        }}
        style={{
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
        }}>
        
        {/* Drawing vector marks overlay */}
        {lines.length > 0 && (
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              width: boundingBoxContainer?.width,
              height: boundingBoxContainer?.height,
            }}>
            {lines.map(([points, color], i) => (
              <path
                key={i}
                d={getSvgPathFromStroke(
                  getStroke(
                    points.map(([x, y]) => [
                      x * boundingBoxContainer!.width,
                      y * boundingBoxContainer!.height,
                      0.5,
                    ]),
                    lineOptions,
                  ),
                )}
                fill={color}
              />
            ))}
          </svg>
        )}

        {/* 2D Bounding Boxes Overlays */}
        {detectType === '2D bounding boxes' &&
          boundingBoxes2D.map((box, i) => {
            const isHovered = i === hoveredBox;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 260, delay: Math.min(i * 0.05, 0.4) }}
                className={`absolute bbox border-2 border-[var(--accent-color)] rounded-sm group ${isHovered ? 'reveal ring-2 ring-[var(--accent-color)]/25 bg-[var(--accent-color)]/10' : ''}`}
                style={{
                  transformOrigin: '0 0',
                  top: box.y * 100 + '%',
                  left: box.x * 100 + '%',
                  width: box.width * 100 + '%',
                  height: box.height * 100 + '%',
                }}>
                
                {/* HUD label tag */}
                <div className="bg-[var(--accent-color)] text-white absolute left-0 top-0 text-[10px] font-mono font-bold px-1.5 py-0.5 shadow-md flex items-center gap-1 uppercase tracking-wide rounded-br-sm -translate-y-[2px] -translate-x-[2px] border border-white/10">
                  <span className="text-white/50 text-[8px]">ID.0{i+1}</span>
                  <span>{box.label}</span>
                </div>

                {/* Cyber corner marks within bounding box */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute w-1.5 h-1.5 border-t border-l border-white/50 top-0 left-0" />
                  <div className="absolute w-1.5 h-1.5 border-t border-r border-white/50 top-0 right-0" />
                  <div className="absolute w-1.5 h-1.5 border-b border-l border-white/50 bottom-0 left-0" />
                  <div className="absolute w-1.5 h-1.5 border-b border-r border-white/50 bottom-0 right-0" />
                </div>
              </motion.div>
            );
          })}

        {/* 2D Point Coordinates Overlays */}
        {detectType === 'Points' &&
          points.map((point, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: Math.min(i * 0.04, 0.3) }}
                className="absolute"
                style={{
                  left: `${point.point.x * 100}%`,
                  top: `${point.point.y * 100}%`,
                }}>
                {/* Echo wave effect ring */}
                <div className="pulse-ring-effect -translate-x-1/2 -translate-y-1/2 absolute" />
                
                {/* HUD label tag with tooltip */}
                <div className="absolute bg-[var(--accent-color)] text-center text-white text-[10px] font-mono font-bold px-2 py-0.5 bottom-4 rounded shadow-md -translate-x-1/2 left-1/2 whitespace-nowrap border border-white/20 uppercase tracking-wider flex items-center gap-1">
                  <span className="text-white/50 text-[8px]">PT.0{i+1}</span>
                  <span>{point.label}</span>
                </div>

                {/* Interactive coordinate bullet */}
                <div className="absolute w-3.5 h-3.5 bg-[var(--accent-color)] rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-150 cursor-crosshair" />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
