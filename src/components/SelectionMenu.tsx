import { useState } from "react";

interface SelectionMenuProps {
  text: string;
  onClose: () => void;
}

export default function SelectionMenu({ text, onClose }: SelectionMenuProps) {
  const [translation, setTranslation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const speak = (txt: string) => {
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error al reproducir audio:", error);
      alert("Tu navegador no soporta síntesis de voz");
    }
  };

  const translate = async () => {
    if (loading) return;
    
    setLoading(true);
    setTranslation("");

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

      if (!res.ok) throw new Error("Error en la respuesta");

      const data = await res.json();
      setTranslation(data.translatedText || "No se pudo traducir");
    } catch (error) {
      console.error("Error al traducir:", error);
      setTranslation("Error al traducir 😞");
    } finally {
      setLoading(false);
    }
  };

  const addCard = () => {
    const card = {
      id: Date.now().toString(),
      front: text,
      back: translation || "(sin traducción)",
      timestamp: new Date().toISOString(),
    };
    
    console.log("Tarjeta creada:", card);
    
    // Guardar en localStorage
    try {
      const cards = JSON.parse(localStorage.getItem('ankiCards') || '[]');
      cards.push(card);
      localStorage.setItem('ankiCards', JSON.stringify(cards));
      
      // Feedback visual
      const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
      alert(`✅ Tarjeta añadida!\n\n📝 Frente: ${preview}\n🌐 Reverso: ${translation || "(sin traducción)"}`);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la tarjeta");
    }
    
    onClose();
  };

  // Auto-traducir al abrir el menú
  useState(() => {
    if (!translation && !loading) {
      translate();
    }
  });

  return (
    <>
      {/* Overlay para cerrar al tocar fuera */}
      <div className="menu-overlay" onClick={onClose} />
      
      {/* Panel deslizante desde abajo */}
      <div className="selection-panel">
        {/* Barra superior para arrastrar (visual) */}
        <div className="panel-handle">
          <div className="panel-handle-bar"></div>
        </div>

        {/* Contenido del panel */}
        <div className="panel-content">
          {/* Texto seleccionado */}
          <div className="selected-text-display">
            <div className="text-label">📝 Texto seleccionado</div>
            <div className="text-content">{text}</div>
          </div>

          {/* Traducción */}
          <div className="translation-section">
            <div className="text-label">🌐 Traducción al español</div>
            {loading ? (
              <div className="translation-loading">
                <div className="spinner"></div>
                Traduciendo...
              </div>
            ) : translation ? (
              <div className="translation-content">{translation}</div>
            ) : (
              <div className="translation-error">No disponible</div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="panel-actions">
            <button 
              onClick={() => speak(text)}
              className="action-btn btn-secondary"
            >
              🔊 Escuchar
            </button>
            
            <button 
              onClick={translate}
              disabled={loading}
              className="action-btn btn-secondary"
            >
              {loading ? "⏳" : "🔄"} Re-traducir
            </button>
          </div>

          {/* Botón principal */}
          <button 
            onClick={addCard}
            className="action-btn btn-primary btn-large"
            disabled={loading}
          >
            ✅ Añadir a mis Tarjetas
          </button>

          {/* Botón cancelar */}
          <button 
            onClick={onClose}
            className="action-btn btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </div>

      <style>{`
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .selection-panel {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
          z-index: 10001;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .panel-handle {
          padding: 12px 0 8px;
          display: flex;
          justify-content: center;
          cursor: grab;
        }

        .panel-handle-bar {
          width: 40px;
          height: 4px;
          background: #cbd5e1;
          border-radius: 2px;
        }

        .panel-content {
          padding: 0 20px 24px;
        }

        .text-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .selected-text-display {
          margin-bottom: 20px;
        }

        .text-content {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
          font-size: 15px;
          line-height: 1.6;
          color: #1e293b;
        }

        .translation-section {
          margin-bottom: 20px;
        }

        .translation-content {
          background: #f0fdf4;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #10b981;
          font-size: 15px;
          line-height: 1.6;
          color: #1e293b;
        }

        .translation-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          color: #64748b;
          font-size: 14px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .translation-error {
          padding: 12px;
          color: #64748b;
          font-size: 14px;
          font-style: italic;
        }

        .panel-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        .action-btn {
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 20px;
          min-height: 48px;
        }

        .action-btn:active {
          transform: scale(0.97);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-cancel {
          background: transparent;
          color: #64748b;
          margin-top: 8px;
        }

        .btn-cancel:hover {
          background: #f8fafc;
        }

        .btn-large {
          width: 100%;
          font-size: 16px;
          padding: 16px;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .panel-content {
            padding: 0 16px 20px;
          }

          .text-content,
          .translation-content {
            font-size: 14px;
          }

          .action-btn {
            font-size: 14px;
            padding: 12px 16px;
          }
        }
      `}</style>
    </>
  );
}