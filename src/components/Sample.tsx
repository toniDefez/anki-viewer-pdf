import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
// Use Vite's asset import so the worker is emitted and served correctly
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import SelectionMenu from "./SelectionMenu";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface SelectionInfo {
  text: string;
  rect: { x: number; y: number };
}

export default function PdfReader() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onLoadSuccess = (pdf: PDFDocumentProxy) => setNumPages(pdf.numPages);

  // Detectar selección de texto sin bloquear menú nativo
  useEffect(() => {
    const handleMouseUp = () => {
      // Pequeña espera para no interferir con el menú del sistema
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (!text) {
          setSelection(null);
          return;
        }

        if (!sel || sel.rangeCount === 0) {
          setSelection(null);
          return;
        }

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const container = containerRef.current?.getBoundingClientRect();

        const x = rect.left - (container?.left || 0);
        const y = rect.top - (container?.top || 0) - 35;

        setSelection({ text, rect: { x, y } });
      }, 300);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[80%] mx-auto mt-6 p-4 bg-gray-50 border rounded-lg shadow"
    >
      <h2 className="font-semibold mb-3 text-lg">
        📖 Lector PDF con menú del navegador + menú inteligente
      </h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3"
      />

      {file && (
        <Document file={file} onLoadSuccess={onLoadSuccess}>
          {Array.from(new Array(numPages), (_, i) => (
            <Page
              key={`page_${i + 1}`}
              pageNumber={i + 1}
              width={800}
              renderAnnotationLayer
              renderTextLayer
            />
          ))}
        </Document>
      )}

      {selection && (
        <SelectionMenu
          text={selection.text}
          position={selection.rect}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  );
}
