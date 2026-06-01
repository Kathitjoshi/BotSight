import {GoogleGenAI} from '@google/genai';
import {jsonrepair} from 'jsonrepair';
import {useAtom} from 'jotai';
import getStroke from 'perfect-freehand';
import React, {useState} from 'react';
import {
  BoundingBoxes2DAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  IsLoadingAtom,
  IsThinkingEnabledAtom,
  LinesAtom,
  PointsAtom,
  PromptsAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  SelectedModelAtom,
  TemperatureAtom,
} from './atoms';
import {lineOptions} from './consts';
import {DetectTypes} from './Types';
import {getSvgPathFromStroke, loadImage} from './utils';
import {Send, Sparkles, BrainCircuit} from 'lucide-react';
import {motion} from 'motion/react';

// Get API Key with multiple fallbacks to ensure flexibility
const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({apiKey: apiKey || undefined});

// Helper to determine the best prompt for the robotics model
const getRoboticsPrompt = (type: DetectTypes, target: string) => {
  switch (type) {
    case '2D bounding boxes':
      return `Task: Detect ${target}.
Return a JSON array of objects.
Each object must have:
- "box_2d": [ymin, xmin, ymax, xmax] (coordinates 0-1000)
- "label": text label
Example: [{"box_2d": [100, 200, 300, 400], "label": "example"}]
Avoid points. Return ONLY the JSON.`;

    case 'Points':
      return `Task: Point to ${target}.
Return a JSON array of objects.
Each object must have:
- "point": [y, x] (coordinates 0-1000)
- "label": text label
Example: [{"point": [500, 500], "label": "example"}]
Return ONLY the JSON.`;

    default:
      return target;
  }
};

export function Prompt() {
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [targetPrompt, setTargetPrompt] = useState('items');
  const [selectedModel, setSelectedModel] = useAtom(SelectedModelAtom);
  const [isThinkingEnabled, setIsThinkingEnabled] = useAtom(
    IsThinkingEnabledAtom,
  );

  const [prompts, setPrompts] = useAtom(PromptsAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);
  const [, setRequestJson] = useAtom(RequestJsonAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);
  const [responseTime, setResponseTime] = useState<string | null>(null);

  const is2d = detectType === '2D bounding boxes';
  const currentModel = selectedModel;

  async function handleSend() {
    setIsLoading(true);
    setRequestJson('');
    setResponseJson('');
    setResponseTime(null);
    const startTime = performance.now();

    // Guard to check if Gemini API Key is missing
    if (!apiKey) {
      setTimeout(() => {
        setResponseJson(
          JSON.stringify(
            {
              error: 'GEMINI_API_KEY IS MISSING',
              suggestion: 'Please configure the GEMINI_API_KEY environment variable in your .env file or hosting provider (Render / Vercel) dashboard settings to run spatial understanding queries.',
              system: 'Computer Vision Stage operational - Pipeline offline.',
            },
            null,
            2,
          ),
        );
        setIsLoading(false);
      }, 600);
      return;
    }

    try {
      let activeDataURL;
      const maxSize = 640;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;

      if (imageSrc) {
        const image = await loadImage(imageSrc);
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        copyCanvas.width = image.width * scale;
        copyCanvas.height = image.height * scale;
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      } else {
        setIsLoading(false);
        return;
      }
      activeDataURL = copyCanvas.toDataURL('image/png');

      if (lines.length > 0) {
        for (const line of lines) {
          const p = new Path2D(
            getSvgPathFromStroke(
              getStroke(
                line[0].map(([x, y]) => [
                  x * copyCanvas.width,
                  y * copyCanvas.height,
                  0.5,
                ]),
                lineOptions,
              ),
            ),
          );
          ctx.fillStyle = line[1];
          ctx.fill(p);
        }
        activeDataURL = copyCanvas.toDataURL('image/png');
      }

      setHoverEntered(false);
      const config: {
        temperature: number;
        thinkingConfig?: {thinkingBudget: number};
        responseMimeType?: string;
      } = {
        temperature,
        responseMimeType: 'application/json',
      };

      const model = currentModel;
      let setThinkingBudgetZero = !isThinkingEnabled;
      if (setThinkingBudgetZero) {
        config.thinkingConfig = {thinkingBudget: 0};
      }

      let textPromptToSend = '';
      if (detectType === '2D bounding boxes') {
        textPromptToSend = getRoboticsPrompt('2D bounding boxes', targetPrompt);
      } else {
        textPromptToSend = getRoboticsPrompt(detectType, prompts[detectType]?.[1] ?? '');
      }

      const requestPayload = {
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: activeDataURL.replace('data:image/png;base64,', ''),
                mimeType: 'image/png',
              },
            },
            {text: textPromptToSend},
          ],
        },
        config,
      };

      const displayPayload = JSON.parse(JSON.stringify(requestPayload));
      displayPayload.contents.parts[0].inlineData.data =
        '<BASE64_IMAGE_DATA_REDACTED>';
      setRequestJson(JSON.stringify(displayPayload, null, 2));

      const genAIResponse = await ai.models.generateContent(requestPayload);
      let response = genAIResponse.text;

      if (response && response.includes('```json')) {
        response = response.split('```json')[1].split('```')[0];
      }
      
      let parsedResponse: any[] = [];
      try {
        const repaired = jsonrepair(response ?? "");
        const parsed = JSON.parse(repaired);
        setResponseJson(JSON.stringify(parsed, null, 2));
        
        if (Array.isArray(parsed)) {
          parsedResponse = parsed;
        } else if (parsed && typeof parsed === 'object') {
          const possibleArray = parsed.items || parsed.boxes || parsed.results || parsed.masks || Object.values(parsed).find(Array.isArray);
          if (Array.isArray(possibleArray)) {
            parsedResponse = possibleArray;
          } else {
            throw new Error("Could not find an array of items in the API response.");
          }
        } else {
          throw new Error("Unexpected JSON format.");
        }
      } catch (e: any) {
        setResponseJson(response ?? "");
        throw new Error(`Failed to parse API response: ${e.message}`);
      }

      // Format detection logic: Check what data we actually got back
      const hasBoxes = parsedResponse.some(item => item.box_2d || item.box_2D || item.box || item.bounding_box || item.bounding_box_2d);
      const hasPoints = parsedResponse.some(item => item.point || item.point_2d || item.coordinates);

      // 1. Prepare formatted data
      const formattedBoxes = parsedResponse.map((box: any) => {
        const box2d = box.box_2d || box.box_2D || box.box || box.bounding_box || box.bounding_box_2d;
        if (!Array.isArray(box2d) || box2d.length !== 4) return null;
        const [ymin, xmin, ymax, xmax] = box2d;
        return {
          x: xmin / 1000,
          y: ymin / 1000,
          width: (xmax - xmin) / 1000,
          height: (ymax - ymin) / 1000,
          label: box.label || "unknown",
        };
      }).filter(Boolean);

      const formattedPoints = parsedResponse.map((pointData: any) => {
        const pt = pointData.point || pointData.point_2d || pointData.coordinates;
        if (!Array.isArray(pt) || pt.length !== 2) return null;
        return {
          point: { x: pt[1] / 1000, y: pt[0] / 1000 },
          label: pointData.label || "unknown",
        };
      }).filter(Boolean);

      // 2. Route to state atoms
      setHoverEntered(false);
      setBoundingBoxes2D([]);
      setPoints([]);

      if (detectType === '2D bounding boxes' && hasBoxes) {
        setBoundingBoxes2D(formattedBoxes as any[]);
      } else if (detectType === 'Points' && hasPoints) {
        setPoints(formattedPoints as any[]);
      } else {
         // Best effort fallback
         if (hasBoxes) {
           setBoundingBoxes2D(formattedBoxes as any[]);
         }
         if (hasPoints) {
           setPoints(formattedPoints as any[]);
         }
      }

    } catch (error: any) {
      console.error('Error processing request:', error);
      setResponseJson(
        JSON.stringify(
          {
            error: 'An error occurred processing the response.',
            details: error.message,
          },
          null,
          2,
        ),
      );
    } finally {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      setResponseTime(`Time Delta: ${duration}s`);
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4.5 w-full">
      {/* Model Spec select cards */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-color-secondary)]">
          Vision Processing Model
        </label>
        <div className="relative">
          <select
            value={currentModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
            }}
            disabled={isLoading}
            className="w-full bg-[var(--input-color)] border border-[var(--border-color)] rounded-xl py-3 px-3.5 text-xs font-mono font-medium focus:ring-2 focus:ring-[var(--accent-color)]/20 cursor-pointer text-[var(--text-color-primary)] hover:border-[var(--text-color-secondary)]/50 transition-colors"
          >
            <option value="gemini-robotics-er-1.6-preview">
              robotics-er-1.6-preview (optimized)
            </option>
            <option value="gemini-flash-latest">
              gemini-flash-latest (high-speed)
            </option>
          </select>
        </div>
      </div>

      {/* Thinking Parameter Toggle card */}
      <div className="p-3.5 bg-[var(--input-color)] border border-[var(--border-color)] rounded-xl flex flex-col gap-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-wide text-[var(--text-color-primary)]">
          <input
            type="checkbox"
            checked={isThinkingEnabled}
            onChange={(e) => setIsThinkingEnabled(e.target.checked)}
            disabled={isLoading}
            className="w-3.5 h-3.5 accent-[var(--accent-color)] rounded border-[var(--border-color)]"
          />
          <BrainCircuit className={`w-4 h-4 ${isThinkingEnabled ? 'text-[var(--accent-color)] animate-pulse' : 'text-[var(--text-color-secondary)]'}`} />
          <span>Enable Reasoning Chain</span>
        </label>
        <p className="text-[10px] pl-6 h-auto leading-relaxed font-mono text-[var(--text-color-secondary)]">
          Fuses step-by-step reasoning logic. Turning this on boosts complex contextual identification, but switching off yields rapid bounding predictions.
        </p>
      </div>

      {/* Temperature dial control */}
      <div className="flex flex-col gap-1.5 mt-1 font-mono">
        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[var(--text-color-secondary)]">
          <span>Stochastic Temperature</span>
          <span className="font-bold text-[var(--accent-color)]">{temperature}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          disabled={isLoading}
          className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
        />
      </div>

      <div className="border-b border-[var(--border-color)]/60 my-1"></div>

      {/* Target query textbox */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-color-secondary)]">
          {is2d ? 'Target objects list' : 'Target coordinate label'}
        </label>
        {is2d ? (
          <textarea
            className="w-full bg-[var(--input-color)] rounded-xl border border-[var(--border-color)] p-3 text-xs font-mono h-20 resize-none"
            placeholder="e.g., green fruits, table legs, robot arm claw"
            value={targetPrompt}
            onChange={(e) => setTargetPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        ) : (
          <textarea
            className="w-full bg-[var(--input-color)] rounded-xl border border-[var(--border-color)] p-3 text-xs font-mono h-20 resize-none"
            placeholder="What feature should the system point to?"
            value={prompts[detectType]?.[1] ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              const newPromptsState = {...prompts};
              if (!newPromptsState[detectType])
                newPromptsState[detectType] = ['', '', ''];
              newPromptsState[detectType][1] = value;
              setPrompts(newPromptsState);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        )}
      </div>

      {/* Dispatch Button with latency indicators */}
      <div className="flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2.5 font-bold font-mono text-xs uppercase tracking-wider text-white shadow-md cursor-pointer transition-all ${
            isLoading || !imageSrc
              ? 'bg-slate-400 cursor-not-allowed opacity-60 shadow-none'
              : 'bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/95 shadow-[var(--accent-color)]/10 border-glow'
          }`}
          onClick={handleSend}
          disabled={isLoading || !imageSrc}
          style={{ minHeight: '0' }}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Resolving scene...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Engage Detection Engine</span>
            </>
          )}
        </motion.button>
        {responseTime && (
          <div className="text-[10px] text-right text-[var(--text-color-secondary)] font-mono uppercase tracking-wider">
            {responseTime}
          </div>
        )}
      </div>
    </div>
  );
}
