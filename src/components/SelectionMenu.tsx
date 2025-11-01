import { useEffect, useRef, useState } from "react";

interface SelectionMenuProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function SelectionMenu({ text, position, onClose }: SelectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [translation, setTranslation] = useState<string>("");

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  const speak = (txt: string) => {
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const translate = async () => {
    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        body: JSON.stringify({
          q: text,
          source: "en",
          target: "es",
          format: "text",
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setTranslation(data.translatedText);
    } catch {
      setTranslation("Error al traducir 😞");
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px",
        minWidth: "220px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        zIndex: 100,
      }}
    >
      <p className="font-semibold text-sm mb-2">{text}</p>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={translate}
          className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
        >
          Traducir
        </button>

        <button
          onClick={() => speak(text)}
          className="bg-gray-200 text-black text-xs px-2 py-1 rounded"
        >
          🔊 Pronunciar
        </button>

        <button
          onClick={() => alert(`Añadiendo tarjeta: ${text}`)}
          className="bg-green-600 text-white text-xs px-2 py-1 rounded"
        >
          ➕ Añadir tarjeta
        </button>
      </div>

      {translation && (
        <p className="mt-2 text-sm border-t pt-2 text-gray-700">
          <strong>Traducción:</strong> {translation}
        </p>
      )}
    </div>
  );
}
