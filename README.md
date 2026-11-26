## Clipfora

A macOS app for clipping long videos into 9:16 content, built with Electron, React, TypeScript and Tailwind CSS.

| Panel                       | What it does                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Resources** (left)        | Drop or browse for video, audio and images. Files stay where they are on your Mac. The **Info** tab holds the campaign rules. |
| **Preview** (center)        | The open file inside a 1080 × 1920 frame, with a safe zone overlay and a fill or fit switch.                                  |
| **Clipping prompt** (right) | Describe the clips you want. The prompt, the campaign info and the files become one brief to copy.                            |
| **Timeline** (bottom)       | The open file on a time ruler. Click or drag to scrub, and zoom in on long recordings.                                        |

Keys: Space plays or pauses, Home and End jump to the start and end, the arrow keys step one frame, and Shift with an arrow steps one second.

```bash
npm install        # install dependencies and the Electron binary
npm run dev        # run the app with hot reload
npm run build:mac  # package a macOS build into dist/
```

Before committing: `npm run format && npm run lint && npm run typecheck && npm test`.
