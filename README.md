# Robotics Spatial Understanding Engine

The Robotics Spatial Understanding Engine is a static, highly interactive Single Page Application (SPA) designed to demonstrates how multimodal large language models—specifically Google Gemini—resolve geometric, spatial, and coordinate-bound queries on live physical scenes. The software projects real-time environment telemetry, parses normalized spatial data models, translates multidimensional boundary matrices, and exposes the structural underlying API loops using the `@google/genai` TypeScript SDK.

---

## 1. Deep Dive Into Application Flow and Mechanics

The application functions as a cybernetic feedback control loops divided into five serial stages:

### A. Environment Calibration & Frame Capture
- **Source Aggregation**: The application loads template camera views depicting industrial robot arms, cluttered shelves, household furniture, or specialized baskets. Alternatively, users drag-and-drop or select locally acquired images.
- **Dynamic Local Overlays**: The user can draw directly onto the environment view using a freehand path canvas. When annotations are present, the canvas rasterizes these paths into a composite binary image payload prior to transmission. This allows users to label/focus the attention of the model or draw conceptual barriers.

### B. Prompt Construction & Pipeline Engineering
Depending on the detection task, target identifiers are formulated. To keep formatting secure, structured text prompts instruct the model to produce specialized JSON arrays containing numeric vectors representing either coordinates or bounding bounds:
- **2D Bounding Boxes**: Instructs the model to output coordinates scaled to a `[0, 1000]` range mapped relative to the image borders using the standard bounding box format: `[ymin, xmin, ymax, xmax]`.
- **Points (Pinpoint Mapping)**: Instructs the model to pinpoint requested structures or tools by mapping coordinates to `[y, x]` coordinate vectors using the same `[0, 1000]` normalized scale.

Each request enforces model return formatting to `application/json` mode combined with optional **Reasoning Chain Tracks** (`thinkingConfig` budget overrides for reasoning capabilities when using optimized models like `robotics-er-1.6-preview`).

### C. Request Parsing and Coordinate Mapping Translation
Once the Gemini model returns the JSON payload, it goes through a validation layer using `jsonrepair` and `JSON.parse`. The scale vectors `[0, 1000]` must be translated to responsive screen space percentages.

The translation logic computes:
- For Bounding Boxes where the system receives `[ymin, xmin, ymax, xmax]`:
  $$\text{Top} (\%) = \frac{\text{ymin}}{1000} \times 100$$
  $$\text{Left} (\%) = \frac{\text{xmin}}{1000} \times 100$$
  $$\text{Width} (\%) = \frac{\text{xmax} - \text{xmin}}{1000} \times 100$$
  $$\text{Height} (\%) = \frac{\text{ymax} - \text{ymin}}{1000} \times 100$$

- For Points where the system receives `[y, x]`:
  $$\text{Y Position} (\%) = \frac{\text{y}}{1000} \times 100$$
  $$\text{X Position} (\%) = \frac{\text{x}}{1000} \times 100$$

These mathematical values are assigned to responsive CSS absolute alignments within a target viewport rendering layer, ensuring boundary overlays adjust during runtime window resizing events.

### D. Rendering Projective Overlays
Overlays are rendered using high-fidelity vector graphics and CSS keyframe scan lines. Dynamic bounding tags are paired with spring alignments via `motion/react` to prevent jarring transitions. 

---

## 2. Directory Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml             # Automated Continuous Integration check-runs
├── src/
│   ├── atoms.ts               # Jotai global variables state parameters
│   ├── App.tsx                # Responsive 3-column telemetry workspace layout component
│   ├── Content.tsx            # Camera vision stage, Canvas painters, and projecting overlays
│   ├── DetectTypeSelector.tsx # Mode switches (2D boxes vs. Pinpoint Coordinates)
│   ├── ExampleImages.tsx      # Pre-calibrated environment reference images
│   ├── ExtraModeControls.tsx  # Extended Canvas brushes, palettes, and deletions
│   ├── Palette.tsx            # Drawing pigment arrays
│   ├── Prompt.tsx             # Dispatch parameters, reasoning toggles, and API handlers
│   ├── SideControls.tsx       # File upload zones, drag selectors, and brush hooks
│   ├── TopBar.tsx             # Platform titles, reset events, and theme options
│   ├── Types.ts               # Core model interfaces and Type definitions
│   ├── consts.ts              # System metadata, links, and baseline canvas configs
│   ├── hooks.ts               # Application reset controllers
│   ├── main.tsx               # Client DOM renderer init
│   ├── utils.ts               # Image loading controllers and path vector conversion
│   └── index.css              # Typography configurations and responsive animation timelines
├── index.html                 # Primary HTML container
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite assets and build compilation configs
├── package.json               # System dependencies and build tooling configuration
└── .env                       # Local environment variables declaration target
```

---

## 3. Local Operational Instructions

### Prerequisites
- Node.js (Version 18 or 20 is recommended)
- A Gemini API Key generated from Google AI Studio

### Local Setup
1. **Unpack Source Files**: Unzip the repository into a directory.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Secrets**:
   - Create a file named `.env` in the root folder.
   - Insert your secret key using the standard structure below:
     ```env
     GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHereUnderSecret"
     ```
4. **Boot Development Server**:
   ```bash
   npm run dev
   ```
5. **Open Sandbox Context**:
   - Navigate in your browser to `http://localhost:3000`.

---

## 4. Production Deployment Verification

Because this is a **Single Page Application (SPA)** written using standard Vite and React 18, it does not require a backend node server to query. It executes Gemini commands directly from the user's client browser using the environment variables embedded during building or loaded dynamically.

**Vercel config/rules (No custom `vercel.json` required)**:
Vercel detects Vite applications automatically. Because this application contains a single screen with no client-side routing subpages (e.g. `react-router` paths such as `/dashboard` or `/settings`), standard SPA redirect rules mapped on static servers are unnecessary. The system outputs directly to a plain static folder (`dist/`) that Vercel routes immediately. Ready-to-go build verification has been tested successfully via:
```bash
npm run build
```

---

## 5. Git & Uploading Operations

Use the following step-by-step commands to push your project to a new, secure remote repository securely:

1. **Initialize Git**:
   ```bash
   git init
   ```
2. **Add Files to Staging**:
   ```bash
   git add .
   ```
   *(Ensure `.env` matches rules inside `.gitignore` so your personal API key is never committed).*
3. **Commit Code Assets**:
   ```bash
   git commit -m "Initial commit: Robotics Spatial Understanding Engine"
   ```
4. **Add Remote Target**:
   - Create a repository on GitHub (keep it private to secure API config notes, or public without active `.env` parameters).
   ```bash
   git branch -m main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   ```
5. **Push Code to Remote**:
   ```bash
   git push -u origin main
   ```

---



## 6. License and Copyright Information
MIT License
