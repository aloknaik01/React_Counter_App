import { useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "counter-pro:state";

const TYPES = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  RESET: "RESET",
  SET_STEP: "SET_STEP",
  SET_MIN: "SET_MIN",
  SET_MAX: "SET_MAX",
  UNDO: "UNDO",
  REDO: "REDO",
  TICK: "TICK",
  TOGGLE_AUTO: "TOGGLE_AUTO",
  LOAD: "LOAD",
};

const DEFAULTS = {
  value: 0,
  step: 1,
  min: 0,
  max: 100,
  auto: false,
  past: [],
  future: [],
  history: [],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed, past: [], future: [], history: [] };
  } catch {
    return DEFAULTS;
  }
}

function save(state) {
  try {
    const { value, step, min, max, auto } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ value, step, min, max, auto })
    );
  } catch {
    // ignore
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function pushHistory(history, line) {
  const next = [line, ...history];
  return next.slice(0, 5);
}

function pushPast(state) {
  return [...state.past, state.value].slice(-50);
}

function sanitizeStep(n) {
  const x = Math.floor(Number(n));
  return Number.isFinite(x) && x > 0 ? x : 1;
}

function reducer(state, action) {
  switch (action.type) {
    case TYPES.LOAD:
      return load();

    case TYPES.SET_STEP: {
      const step = sanitizeStep(action.step);
      return { ...state, step };
    }

    case TYPES.SET_MIN: {
      let min = Number(action.min);
      if (!Number.isFinite(min)) min = state.min;
      if (min > state.max) min = state.max;
      const value = clamp(state.value, min, state.max);
      return { ...state, min, value };
    }

    case TYPES.SET_MAX: {
      let max = Number(action.max);
      if (!Number.isFinite(max)) max = state.max;
      if (max < state.min) max = state.min;
      const value = clamp(state.value, state.min, max);
      return { ...state, max, value };
    }

    case TYPES.RESET: {
      return {
        ...state,
        past: pushPast(state),
        future: [],
        value: state.min,
        history: pushHistory(state.history, `Reset → ${state.min}`),
      };
    }

    case TYPES.INCREMENT: {
      const next = clamp(state.value + state.step, state.min, state.max);
      if (next === state.value) return state;
      return {
        ...state,
        past: pushPast(state),
        future: [],
        value: next,
        history: pushHistory(state.history, `+${state.step} → ${next}`),
      };
    }

    case TYPES.DECREMENT: {
      const next = clamp(state.value - state.step, state.min, state.max);
      if (next === state.value) return state;
      return {
        ...state,
        past: pushPast(state),
        future: [],
        value: next,
        history: pushHistory(state.history, `-${state.step} → ${next}`),
      };
    }

    case TYPES.UNDO: {
      if (!state.past.length) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [state.value, ...state.future].slice(0, 50),
        value: prev,
        history: pushHistory(state.history, `Undo → ${prev}`),
      };
    }

    case TYPES.REDO: {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        ...state,
        past: [...state.past, state.value].slice(-50),
        future: state.future.slice(1),
        value: next,
        history: pushHistory(state.history, `Redo → ${next}`),
      };
    }

    case TYPES.TOGGLE_AUTO:
      return { ...state, auto: !state.auto };

    case TYPES.TICK: {
      const next = clamp(state.value + state.step, state.min, state.max);
      if (next === state.value) return state;
      return {
        ...state,
        past: pushPast(state),
        future: [],
        value: next,
        history: pushHistory(state.history, `Auto +${state.step} → ${next}`),
      };
    }

    default:
      return state;
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const { value, step, min, max, auto, history } = state;

  useEffect(() => {
    save(state);
  }, [value, step, min, max, auto]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      // Undo / Redo
      if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        dispatch({ type: TYPES.UNDO });
        return;
      }
      if (e.ctrlKey && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        dispatch({ type: TYPES.REDO });
        return;
      }
      // + / - / r
      if (e.key === "+" || e.key === "=") dispatch({ type: TYPES.INCREMENT });
      if (e.key === "-") dispatch({ type: TYPES.DECREMENT });
      if (e.key === "r" || e.key === "R") dispatch({ type: TYPES.RESET });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto increment interval
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => dispatch({ type: TYPES.TICK }), 1000);
    return () => clearInterval(id);
  }, [auto]);

  // Animation
  const numberAnim = {
    key: value,
    initial: { y: 10, opacity: 0, scale: 0.98 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -10, opacity: 0, scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 28 },
    style: { display: "inline-block" },
  };

  const s = {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 20,
      background: "#0b0c10",
    },
    card: {
      width: "min(720px, 92vw)",
      background: "#111218",
      color: "#e6e6e6",
      border: "1px solid #1f2430",
      borderRadius: 16,
      boxShadow: "0 10px 25px rgba(0,0,0,.25)",
      padding: 20,
    },
    row: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
    centerRow: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    btn: {
      padding: "10px 16px",
      borderRadius: 12,
      border: "1px solid #1f2430",
      background: "#151823",
      color: "#e6e6e6",
      cursor: "pointer",
    },
    btnPrimary: {
      background: "linear-gradient(180deg,#6ee7b7,#2f7b66)",
      border: "none",
      color: "white",
    },
    btnDanger: {
      background: "linear-gradient(180deg,#ff6b6b,#b53a3a)",
      border: "none",
      color: "white",
    },
    input: {
      width: 120,
      padding: "10px 12px",
      background: "transparent",
      color: "#e6e6e6",
      border: "1px solid #1f2430",
      borderRadius: 12,
      outline: "none",
    },
    label: { fontSize: 13, color: "#b6b6b6" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    numberWrap: { textAlign: "center", margin: "8px 0" },
    number: { fontSize: 64, lineHeight: 1, minHeight: 72 },
    muted: { color: "#b6b6b6", fontSize: 12 },
    switch: (on) => ({
      position: "relative",
      width: 52,
      height: 28,
      borderRadius: 999,
      border: "1px solid #1f2430",
      background: on ? "#2a5a4d" : "#1f2430",
      cursor: "pointer",
    }),
    dot: (on) => ({
      position: "absolute",
      top: 2,
      left: on ? 26 : 2,
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "#fff",
      transition: "left .2s",
    }),
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <h1 style={{ margin: 0 }}>Counter Pro</h1>
          <div style={s.row}>
            <div
              role="switch"
              aria-checked={auto}
              aria-label={
                auto ? "Disable auto increment" : "Enable auto increment"
              }
              onClick={() => dispatch({ type: TYPES.TOGGLE_AUTO })}
              style={s.switch(auto)}
            >
              <div style={s.dot(auto)} />
            </div>
            <span style={s.muted}>Auto increment (1s)</span>
          </div>
        </div>

        {/* Number display */}
        <div style={s.numberWrap} aria-live="polite" aria-atomic="true">
          <div style={s.number}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span {...numberAnim}>{value}</motion.span>
            </AnimatePresence>
          </div>
          <div style={s.muted}>
            Range: {min} – {max}
          </div>
        </div>

        {/* Main controls */}
        <div style={{ ...s.centerRow, marginTop: 8 }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={s.btn}
            onClick={() => dispatch({ type: TYPES.UNDO })}
          >
            Undo
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={s.btn}
            onClick={() => dispatch({ type: TYPES.REDO })}
          >
            Redo
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{ ...s.btn, ...s.btnDanger }}
            onClick={() => dispatch({ type: TYPES.RESET })}
          >
            Reset
          </motion.button>
        </div>

        <div style={{ ...s.centerRow, marginTop: 8 }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={s.btn}
            onClick={() => dispatch({ type: TYPES.DECREMENT })}
          >
            – Decrease
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{ ...s.btn, ...s.btnPrimary }}
            onClick={() => dispatch({ type: TYPES.INCREMENT })}
          >
            + Increase
          </motion.button>
        </div>

        {/* Step / Min / Max */}
        <div style={{ ...s.centerRow, marginTop: 10 }}>
          <div>
            <label htmlFor="step" style={s.label}>
              Step
            </label>
            <input
              id="step"
              type="number"
              min={1}
              step={1}
              value={step}
              onChange={(e) =>
                dispatch({ type: TYPES.SET_STEP, step: e.target.value })
              }
              style={s.input}
            />
          </div>
          <div>
            <label htmlFor="min" style={s.label}>
              Min
            </label>
            <input
              id="min"
              type="number"
              value={min}
              onChange={(e) =>
                dispatch({ type: TYPES.SET_MIN, min: e.target.value })
              }
              style={s.input}
            />
          </div>
          <div>
            <label htmlFor="max" style={s.label}>
              Max
            </label>
            <input
              id="max"
              type="number"
              value={max}
              onChange={(e) =>
                dispatch({ type: TYPES.SET_MAX, max: e.target.value })
              }
              style={s.input}
            />
          </div>
        </div>

        {/* History */}
        <div style={{ marginTop: 14 }}>
          <h2 style={{ margin: "8px 0" }}>Recent actions</h2>
          {history.length === 0 ? (
            <div style={s.muted}>No actions yet.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {history.map((h, i) => (
                <li key={i} style={{ fontSize: 13 }}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Shortcuts hint */}
        <div style={{ marginTop: 12, ...s.muted }}>
          Shortcuts: <code>+</code>, <code>-</code>, <code>R</code>,{" "}
          <code>Ctrl+Z</code>, <code>Ctrl+Y</code>
        </div>
      </div>
    </div>
  );
}
