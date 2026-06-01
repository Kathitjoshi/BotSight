import {useAtom} from 'jotai';
import React, {useEffect} from 'react';
import {Content} from './Content';
import {DetectTypeSelector} from './DetectTypeSelector';
import {ExampleImages} from './ExampleImages';
import {ExtraModeControls} from './ExtraModeControls';
import {Prompt} from './Prompt';
import {SideControls} from './SideControls';
import {TopBar} from './TopBar';
import {
  InitFinishedAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
  ThemeAtom,
  IsLoadingAtom,
} from './atoms';
import {motion, AnimatePresence} from 'motion/react';
import {Terminal, Eye, Cpu, Settings, Code, Sparkles, RefreshCw, Layers} from 'lucide-react';

function JsonDisplay() {
  const [requestJson] = useAtom(RequestJsonAtom);
  const [responseJson] = useAtom(ResponseJsonAtom);
  const [activeTab, setActiveTab] = React.useState<'request' | 'response'>('response');

  useEffect(() => {
    // Auto switch to response tab when response comes in
    if (responseJson) {
      setActiveTab('response');
    } else if (requestJson) {
      setActiveTab('request');
    }
  }, [requestJson, responseJson]);

  return (
    <div className="flex flex-col bg-[var(--box-color)] border border-[var(--border-color)] rounded-xl overflow-hidden h-[340px] lg:h-[450px]">
      {/* Tab select headers */}
      <div className="flex border-b border-[var(--border-color)] bg-[var(--input-color)] items-center px-4 py-2 justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--accent-color)]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-color-primary)]">
            Telemetry Inspector Logs
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'request'
                ? 'bg-[var(--accent-color)] text-white font-medium'
                : 'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]'
            }`}
            style={{ minHeight: '0' }}
          >
            API Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'response'
                ? 'bg-[var(--accent-color)] text-white font-medium'
                : 'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]'
            }`}
            style={{ minHeight: '0' }}
          >
            API Response
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-auto text-[11px] font-mono bg-[var(--bg-color)]/50 grow">
        <AnimatePresence mode="wait">
          {activeTab === 'request' ? (
            <motion.div
              key="req"
              initial={{opacity: 0, y: 5}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -5}}
              transition={{duration: 0.15}}
              className="h-full"
            >
              <pre className="text-[var(--text-color-primary)] h-full overflow-auto whitespace-pre-wrap select-text">
                <code>
                  {requestJson || '// Initialize prompt & dispatch request to display telemetry log feed...'}
                </code>
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key="res"
              initial={{opacity: 0, y: 5}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -5}}
              transition={{duration: 0.15}}
              className="h-full"
            >
              <pre className="text-[var(--text-color-primary)] h-full overflow-auto whitespace-pre-wrap select-text">
                <code>
                  {responseJson || '// Awaiting Gemini spatial response pipeline...'}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  const [initFinished] = useAtom(InitFinishedAtom);
  const [theme] = useAtom(ThemeAtom);
  const [isLoading] = useAtom(IsLoadingAtom);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen h-[100dvh] bg-[var(--bg-color)] text-[var(--text-color-primary)] select-none">
      {/* Persistent global top nav */}
      <TopBar />

      <div className="flex flex-col lg:flex-row grow overflow-hidden relative">
        {/* Main Grid: 3 columns layout on Desktop */}
        <div className="flex flex-col lg:flex-row grow w-full overflow-y-auto lg:overflow-hidden tech-grid-bg">
          
          {/* Column 1: Source Selection & Actions Menu (~280px to 320px) */}
          <div className="w-full lg:w-[300px] border-b lg:border-b-0 lg:border-r border-[var(--border-color)] bg-[var(--box-color)] flex flex-col p-5 gap-6 shrink-0 z-10">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
              <Layers className="w-4 h-4 text-[var(--accent-color)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
                Capture & Calibration
              </h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono text-[var(--text-color-secondary)] uppercase">
                1. Select Scene
              </span>
              <ExampleImages />
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-[var(--border-color)]/60">
              <span className="text-xs font-mono text-[var(--text-color-secondary)] uppercase">
                2. Input Override
              </span>
              <SideControls />
            </div>
          </div>

          {/* Column 2: Central Active Vision Stage (Flex-1) */}
          <div className="flex-1 flex flex-col p-5 lg:p-6 overflow-hidden h-[400px] lg:h-auto min-w-0 relative justify-center bg-[var(--bg-color)]/10">
            <div className="absolute top-4 left-4 h-5 flex items-center bg-[var(--box-color)] border border-[var(--border-color)] px-2.5 py-1 rounded font-mono text-[10px] text-[var(--text-color-secondary)] uppercase tracking-wider z-15">
              Live Feed Stage: <span className="ml-1 text-[var(--accent-color)] font-bold">CALIBRATED</span>
            </div>
            
            {/* Visual stage viewport */}
            <div className="relative w-full h-[85%] border border-[var(--border-color)] bg-[var(--box-color)] rounded-xl flex items-center justify-center p-2 overflow-hidden shadow-sm border-glow transition-all duration-300">
              {/* Corner reticles for cybernetic aesthetic */}
              <div className="reticle-corner reticle-tl" />
              <div className="reticle-corner reticle-tr" />
              <div className="reticle-corner reticle-bl" />
              <div className="reticle-corner reticle-br" />

              {/* Laser scanning strip when analysis is in-progress */}
              {isLoading && <div className="laser-scanner" />}

              {/* Rendering canvas view */}
              <div className="w-full h-full flex items-center justify-center">
                {initFinished ? <Content /> : (
                  <div className="flex flex-col items-center gap-2 text-sm text-[var(--text-color-secondary)] font-mono animate-pulse">
                    <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent-color)]" />
                    Initializing camera...
                  </div>
                )}
              </div>
            </div>

            {/* In-canvas draw configurations overlay when drawing is active */}
            <div className="shrink-0 w-full z-15 mt-2">
              <ExtraModeControls />
            </div>
          </div>

          {/* Column 3: Processing Node & Inspector Panel (~420px to 480px) */}
          <div className="w-full lg:w-[460px] border-t lg:border-t-0 lg:border-l border-[var(--border-color)] bg-[var(--box-color)] flex flex-col p-5 gap-5 lg:overflow-y-auto shrink-0 z-10">
            
            {/* Model & Config settings */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                <Settings className="w-4 h-4 text-[var(--accent-color)]" />
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
                  Engine Parameters
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <DetectTypeSelector />
              </div>
            </div>

            {/* Spatial prompt entry */}
            <div className="flex flex-col gap-4 py-2 border-t border-[var(--border-color)]/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
                <span className="text-xs font-mono text-[var(--text-color-secondary)] uppercase">
                  Instruction Pipeline
                </span>
              </div>
              <Prompt />
            </div>

            {/* Expanded system inspections */}
            <div className="mt-auto pt-3 border-t border-[var(--border-color)]/60">
              <JsonDisplay />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
