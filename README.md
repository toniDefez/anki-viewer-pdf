# 📚 PDF Vocabulary Assistant

**PDF Vocabulary Assistant** es una aplicación web en **React + Vite** que combina un **lector de PDFs**, un **traductor instantáneo** y un **generador de tarjetas tipo Anki**, todo en una única herramienta.

Está diseñada para estudiantes que leen libros o papers en inglés y quieren **aprender vocabulario directamente desde el texto**, sin cambiar de aplicación.

---

## 🚀 Características principales

### 🧩 Lector de PDF interactivo
- Soporta carga de archivos PDF locales.
- Permite selección de texto dentro del documento.
- Muestra número de página, zoom, miniaturas y navegación.

### ⚡ Traducción instantánea
- Selecciona una palabra o frase → se abre un popover con:
  - Traducción instantánea (inglés → español)
  - Pronunciación por voz (TTS)
  - Botones para crear tarjetas de estudio

### 🧠 Tarjetas de estudio tipo Anki
- Crea tarjetas **Q/A** o **Cloze** al instante desde el texto.
- Guarda automáticamente la palabra/frase, su traducción y la frase de contexto.
- Todo se guarda **localmente** en IndexedDB (sin servidores externos).

### ⏰ Repetición espaciada (SRS)
- Sistema de repaso incorporado basado en el algoritmo **SM-2**.
- Cada tarjeta tiene su propio nivel de dificultad, intervalo y fecha de repaso.
- Modo “Revisar” para practicar las tarjetas pendientes dentro de la app.

### 📤 Exportación a Anki
- Exporta tus tarjetas en formato **CSV** compatible con Anki.
- O conéctate a **AnkiConnect** si usas Anki localmente.

### 🗣️ Pronunciación (TTS)
- Usa la **Web Speech API** para reproducir la palabra o frase seleccionada en inglés.
- Ideal para practicar pronunciación sin salir de la lectura.

---

## 🛠️ Tecnologías utilizadas

| Tipo | Librería / Framework |
|------|----------------------|
| Frontend | React + TypeScript + Vite |
| UI | TailwindCSS |
| Estado global | Zustand |
| PDF Viewer | `@react-pdf-viewer/core` + `@react-pdf-viewer/default-layout` |
| Persistencia local | IndexedDB (via `idb`) |
| Repetición espaciada | Algoritmo SM-2 (implementación propia) |
| Text-to-Speech | Web Speech API |

---

## 📁 Estructura del proyecto
src/
├── components/
│ ├── PdfReaderWithAssistant.tsx # Lector PDF + selección + traducción + tarjetas
│ ├── FlashcardReview.tsx # Modo de repaso (SRS)
│ └── ExportToAnki.tsx # Exportación CSV
├── lib/
│ ├── translate.ts # Función de traducción (mock o API)
│ ├── srs.ts # Algoritmo de repetición espaciada
│ └── db.ts # Persistencia con IndexedDB
├── store/
│ └── useDeckStore.ts # Estado global con Zustand
├── App.tsx
├── main.tsx
└── index.css

## ⚙️ Instalación y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tuusuario/pdf-vocabulary-assistant.git
   cd pdf-vocabulary-assistant



## Instalar dependencias

npm install


Ejecutar en modo desarrollo

npm run dev


Abrir en el navegador

http://localhost:5173

## 🧩 Cómo usar

Carga un archivo PDF (por ejemplo, un libro o artículo en inglés).

Selecciona cualquier palabra o expresión.

En el popover:

Consulta su traducción inmediata.

Escúchala con el botón de TTS.

Crea una tarjeta Q/A o Cloze.

Accede al modo Revisar para practicar tus tarjetas.

Exporta tus tarjetas a Anki cuando quieras.

🔮 Próximas mejoras

🌐 Traducción real conectada a API externa (DeepL, Google Translate, etc.)

🧠 Sugerencias automáticas de expresiones relevantes.

📝 Resaltado persistente dentro del PDF.

📱 Versión responsive para móviles y tablets.

☁️ Sincronización opcional con la nube.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!
Si quieres colaborar:

Haz un fork del repositorio.

Crea una rama con tu nueva funcionalidad.

Envía un pull request.

## 📜 Licencia

Este proyecto está bajo la licencia MIT.
Puedes usarlo, modificarlo y distribuirlo libremente, siempre que se mantenga la atribución.


💬 “Learn as you read.”