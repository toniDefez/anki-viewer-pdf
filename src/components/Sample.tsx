import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import SelectionMenu from "./SelectionMenu";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfReader() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [selectedText, setSelectedText] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onLoadSuccess = async (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    setLoading(false);
    setError(null);

    // Extraer texto de la primera página como ejemplo
    try {
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const words = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .filter(word => word.trim() !== '');
      console.log('Palabras en la página:', words);
    } catch (err) {
      console.error('Error al extraer texto:', err);
    }
  };

  const onLoadError = (err: Error) => {
    setError('Error al cargar el PDF');
    setLoading(false);
    console.error(err);
  };

  // Bloquear menú contextual SOLO (sin bloquear selección)
  useEffect(() => {
    const preventContextMenu = (e: Event) => {
      const target = e.target as Element;
      if (target.closest('.react-pdf__Page')) {
        // Solo prevenir el menú contextual, no el touch
        if (e.type === 'contextmenu') {
          e.preventDefault();
          return false;
        }
      }
    };

    // Solo prevenir menú contextual (click derecho en desktop)
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  // Estado para el contexto de la selección
  const [selectionContext, setSelectionContext] = useState<{ context: string } | null>(null);

  // Detectar selección de texto continuamente
  useEffect(() => {
    const getContext = (selection: Selection) => {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      if (!selectedText) return null;

      const anchorElement =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? (range.startContainer.parentElement as HTMLElement | null)
          : (range.startContainer as HTMLElement | null);
      if (!anchorElement) return null;

      const textLayer = anchorElement.closest(".react-pdf__Page__textContent");
      if (!textLayer) {
        return { context: selectedText };
      }

      const spans = Array.from(textLayer.querySelectorAll("span")).filter(
        (span): span is HTMLSpanElement =>
          !!span.textContent && span.textContent.trim().length > 0
      );
      if (!spans.length) {
        return { context: selectedText };
      }

      const spansWithRect = spans.map(span => ({
        span,
        text: span.textContent ?? "",
        rect: span.getBoundingClientRect(),
      }));

      const anchorSpan = anchorElement.closest("span");
      const anchorIndex = spansWithRect.findIndex(item => item.span === anchorSpan);
      if (anchorIndex === -1) {
        return { context: selectedText };
      }

      const lineHeight = spansWithRect[anchorIndex].rect.height || 12;
      const sameLineThreshold = lineHeight * 0.5;
      const paragraphGapThreshold = lineHeight * 1.8;

      const lines: { parts: string[]; top: number }[] = [];
      const spanLineIndex: number[] = [];
      let currentLine = -1;
      let lastTop = Number.POSITIVE_INFINITY;

      spansWithRect.forEach((item, idx) => {
        if (!Number.isFinite(lastTop) || Math.abs(item.rect.top - lastTop) > sameLineThreshold) {
          lines.push({ parts: [item.text], top: item.rect.top });
          currentLine += 1;
          lastTop = item.rect.top;
        } else {
          lines[currentLine].parts.push(item.text);
        }
        spanLineIndex[idx] = currentLine;
      });

      const anchorLine = spanLineIndex[anchorIndex];
      let startLine = anchorLine;
      for (let i = anchorLine - 1; i >= 0; i--) {
        const gap = lines[i + 1].top - lines[i].top;
        const hasText = lines[i].parts.join(" ").trim().length > 0;
        if (!hasText || gap > paragraphGapThreshold) break;
        startLine = i;
      }

      let endLine = anchorLine;
      for (let i = anchorLine + 1; i < lines.length; i++) {
        const gap = lines[i].top - lines[i - 1].top;
        const hasText = lines[i].parts.join(" ").trim().length > 0;
        if (!hasText || gap > paragraphGapThreshold) break;
        endLine = i;
      }

      const paragraph = lines
        .slice(startLine, endLine + 1)
        .map(line => line.parts.join(" "))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      return { context: paragraph || selectedText };
    };

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      
      if (sel && sel.rangeCount > 0) {
        const selectedText = sel.toString().trim();
        if (selectedText.length > 0) {
          const contextResult = getContext(sel);
          if (contextResult) {
            console.log('Texto seleccionado:', selectedText);
            console.log('Contexto:', contextResult.context);
            setSelectedText(selectedText);
            setSelectionContext(contextResult);
            
            // Vibración táctil si está disponible (feedback móvil)
            if (navigator.vibrate) {
              navigator.vibrate(30);
            }
          }
        }
      } else {
        setSelectedText("");
        setSelectionContext(null);
        setShowMenu(false);
      }
    };

    // Usar selectionchange es más confiable en móvil
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0] || null;
    setFile(newFile);
    setSelectedText("");
    setShowMenu(false);
    if (newFile) setLoading(true);
  };

  const handleOpenMenu = () => {
    if (selectedText) {
      setShowMenu(true);
    }
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setSelectedText("");
    setSelectionContext(null);
    window.getSelection()?.removeAllRanges();
  };

  // Ancho responsive para las páginas
  const pageWidth = typeof window !== 'undefined' 
    ? Math.min(800, window.innerWidth - 40)
    : 800;

  return (
    <div className="pdf-reader-wrapper">
      <div
        ref={containerRef}
        className="pdf-reader-container"
      >
        <h2 className="pdf-reader-title">
          📖 Lector PDF con Tarjetas Anki
        </h2>

        <div className="pdf-reader-instructions">
          💡 <strong>Paso 1:</strong> Selecciona el texto que quieras
          <br />
          📱 <strong>Paso 2:</strong> Toca el botón azul flotante abajo
        </div>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="pdf-reader-input"
        />

        {error && (
          <div className="pdf-reader-error">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="pdf-reader-loading">
            Cargando PDF...
          </div>
        )}

        {file && (
          <Document 
            file={file} 
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<div className="pdf-reader-loading">Cargando documento...</div>}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={`page_${i + 1}`}
                pageNumber={i + 1}
                width={pageWidth}
                renderAnnotationLayer
                renderTextLayer
                className="pdf-page"
              />
            ))}
          </Document>
        )}
      </div>

      {/* Botón flotante SIEMPRE visible */}
      <button
        onClick={handleOpenMenu}
        className={`floating-button ${selectedText ? 'active' : ''}`}
        disabled={!selectedText}
      >
        {selectedText ? (
          <>
            <span className="floating-button-icon">✨</span>
            <span className="floating-button-text">
              Crear Tarjeta
              <span className="floating-button-badge">
                {selectedText.length > 20 ? '20+' : selectedText.length} caracteres
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="floating-button-icon">📝</span>
            <span className="floating-button-text">
              Selecciona texto primero
            </span>
          </>
        )}
      </button>

      {/* Menú que aparece al tocar el botón */}
      {showMenu && selectedText && (
        <SelectionMenu
          text={selectedText}
          context={selectionContext?.context}
          onClose={handleCloseMenu}
        />
      )}

      <style>{`
        .pdf-reader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          font-family: system-ui, -apple-system, sans-serif;
          background: #f9fafb;
          min-height: 100vh;
          padding-bottom: 100px;
        }

        .pdf-reader-container {
          position: relative;
          width: 90%;
          max-width: 900px;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-height: 85vh;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .pdf-reader-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .pdf-reader-instructions {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #1e40af;
          line-height: 1.5;
        }

        .pdf-reader-input {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          width: 100%;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .pdf-reader-input:hover {
          border-color: #3b82f6;
        }

        .pdf-reader-error {
          padding: 1rem;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #dc2626;
        }

        .pdf-reader-loading {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-size: 1rem;
        }

        .pdf-page {
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        /* Botón flotante SIEMPRE visible */
        .floating-button {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #94a3b8;
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 56px;
          max-width: 90%;
        }

        .floating-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .floating-button.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 6px 32px rgba(59, 130, 246, 0.6);
          }
        }

        .floating-button:active {
          transform: translateX(-50%) scale(0.95);
        }

        .floating-button-icon {
          font-size: 20px;
          line-height: 1;
        }

        .floating-button-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .floating-button-badge {
          font-size: 11px;
          font-weight: 400;
          opacity: 0.9;
        }

        /* Optimizar selección para móvil */
        .react-pdf__Page {
          -webkit-user-select: text;
          user-select: text;
          touch-action: pan-y; /* Permitir scroll vertical */
        }

        .react-pdf__Page__textContent {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          /* NO bloquear callout para permitir selección en iOS */
        }

        .react-pdf__Page__textContent span {
          user-select: text !important;
          -webkit-user-select: text !important;
          pointer-events: auto !important;
          cursor: text !important;
          /* Área táctil más grande en móvil */
          padding: 2px 0;
          display: inline-block;
        }

        .react-pdf__Page__textContent::selection {
          background: #3b82f6;
          color: white;
        }

        .react-pdf__Page__textContent *::selection {
          background: #3b82f6;
          color: white;
        }

        @media (pointer: coarse) {
          .react-pdf__Page__textContent span {
            padding: 3px 0;
            line-height: 1.6;
          }
        }

        @media (max-width: 768px) {
          .pdf-reader-wrapper {
            padding: 0.5rem;
            padding-bottom: 100px;
          }

          .pdf-reader-container {
            width: 95%;
            padding: 0.75rem;
          }

          .pdf-reader-title {
            font-size: 1.1rem;
          }

          .floating-button {
            font-size: 14px;
            padding: 12px 20px;
            min-height: 52px;
          }

          .floating-button-icon {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
