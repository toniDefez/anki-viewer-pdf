
import { useEffect } from "react";
import Sample from "./components/Sample";



export default function App() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      import("vconsole").then(({ default: VConsole }) => {
        new VConsole();
        console.log("🧩 vConsole iniciado desde App");
      });
    }
  }, []);

  return <Sample />;
}