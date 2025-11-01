# PDF Vocabulary Assistant

PDF Vocabulary Assistant is a small web app built with React + TypeScript + Vite. It combines a PDF reader, instant translation, and Anki-style flashcard generation to help learners study vocabulary directly from the text they read.

Tagline: Learn as you read.

---

## Key features

### Interactive PDF reader
- Load local PDF files.
- Select text inside the document.
- Page number, zoom, thumbnails and navigation.

### Instant translation
- Select a word or phrase and a popover will appear with:
  - Instant translation (English → Spanish).
  - Voice pronunciation (TTS).
  - Buttons to create study cards.

### Anki-style flashcards
- Create Q/A or Cloze cards directly from selected text.
- The app saves the word/phrase, translation and context sentence automatically.
- All data is stored locally in IndexedDB (no external servers required).

### Spaced repetition (SRS)
- Built-in review system based on the SM-2 algorithm (custom implementation).
- Each card has its own difficulty level, interval and next-review date.
- Review mode to practice pending cards inside the app.

### Export to Anki
- Export cards to CSV compatible with Anki.
- Optional integration with AnkiConnect for local Anki users.

### Pronunciation (TTS)
- Uses the Web Speech API to speak selected words or phrases in English.

---

## Stack / Technologies

| Area | Library / Framework |
|------|--------------------|
| Frontend | React + TypeScript + Vite |
| UI | TailwindCSS (optional) |
| State | Zustand |
| PDF Viewer | `@react-pdf-viewer/core` + `@react-pdf-viewer/default-layout` |
| Persistence | IndexedDB (via `idb`) |
| SRS | SM-2 (custom implementation) |
| TTS | Web Speech API |

Related files in this repo:
- Entry: `src/main.tsx`
- Example App: `src/App.tsx`
- Configs: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`

---

## Suggested project structure

src/
├── components/
│   ├── PdfReaderWithAssistant.tsx    # PDF reader + selection + translation + flashcard creation
│   ├── FlashcardReview.tsx          # Review mode (SRS)
│   └── ExportToAnki.tsx             # CSV / AnkiConnect export
├── lib/
│   ├── translate.ts                 # translation function (mock or API)
│   ├── srs.ts                       # SM-2 algorithm
│   └── db.ts                        # IndexedDB persistence
├── store/
│   └── useDeckStore.ts              # Zustand store
├── App.tsx
├── main.tsx
└── index.css

---

## Installation & run

1. Clone the repository
```powershell
git clone https://github.com/tuusuario/pdf-vocabulary-assistant.git
cd pdf-vocabulary-assistant
```

2. Install dependencies
```powershell
npm install
```

3. Run in development mode
```powershell
npm run dev
```

4. Open in the browser
http://localhost:5173

---

## How to use

1. Load a PDF (book, paper in English, etc.).
2. Select any word or phrase.
3. In the popover:
   - See the instant translation.
   - Play pronunciation with the TTS button.
   - Create a Q/A or Cloze flashcard.
4. Go to Review mode to practice your cards.
5. Export your cards to Anki when needed.

---

## Roadmap / Next improvements

- Connect to real translation APIs (DeepL, Google Translate, etc.).
- Automatic suggestions for useful expressions.
- Persistent highlighting inside the PDF.
- Responsive design and mobile support.
- Optional cloud sync.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a branch with your feature.
3. Open a pull request.

---

## License

MIT — feel free to use, modify and redistribute with attribution.

---

## Notes

This project starts from a Vite + React template. To inspect or modify the example app check:
- `src/App.tsx`
- `src/main.tsx`
- `vite.config.ts`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js`


