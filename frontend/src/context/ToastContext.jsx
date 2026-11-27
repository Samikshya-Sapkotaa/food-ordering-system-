// Toast notifications.
//
// Instead of using the browser's alert() box, any page can call
// showToast("message") and a small coloured card slides in at the
// top right corner and disappears by itself after a few seconds.
//
// This uses the same Context idea as AuthContext: the provider holds
// the data, and useToast() lets any component reach it without
// passing props down through every level.
import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

// how long each toast stays on screen (also used by the CSS bar)
const TOAST_TIME = 3000;

// simple counter so every toast gets a unique key
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function removeToast(id) {
    setToasts((old) => old.filter((t) => t.id !== id));
  }

  // type can be "success", "error" or "info"
  function showToast(message, type = "success") {
    const id = nextId++;
    setToasts((old) => [...old, { id, message, type }]);

    // remove it automatically after a few seconds
    setTimeout(() => removeToast(id), TOAST_TIME);
  }

  function icon(type) {
    if (type === "error") return "!";
    if (type === "info") return "i";
    return "✓"; // tick mark
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* the toasts are drawn on top of the whole page */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={"toast " + t.type}
            onClick={() => removeToast(t.id)}
            title="Click to dismiss"
          >
            <span className="toast-icon">{icon(t.type)}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// helper so components can just write: const { showToast } = useToast();
export function useToast() {
  return useContext(ToastContext);
}
