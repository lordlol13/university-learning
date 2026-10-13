"use client";

import { useState, useRef, useCallback } from "react";
import {
  Calculator,
  X,
  Sparkles,
  ArrowRight,
  Delete,
  Check,
  TrendingUp,
  Equal,
  Keyboard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { evaluateCalculatorExpression, compileCustomExpression } from "@/lib/plot-math";

export interface MathCalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlotFunction: (expr: string) => void;
  initialExpr?: string;
  theme?: "light" | "dark";
}

type CalculatorTab = "standard" | "scientific" | "trig" | "presets";

const QUICK_PRESETS = [
  { label: "Квадратичная", expr: "x^2 - 4" },
  { label: "Кубическая", expr: "x^3 - 3*x" },
  { label: "Синусоида", expr: "2*sin(1.5*x)" },
  { label: "Гауссиана", expr: "3*exp(-x^2)" },
  { label: "Сигмоида", expr: "4 / (1 + exp(-2*x))" },
  { label: "Затухающие колебания", expr: "exp(-0.3*x) * cos(3*x)" },
  { label: "Модуль", expr: "abs(x) - 2" },
  { label: "Гармоники", expr: "sin(x) + 0.5*sin(3*x)" },
];

export function MathCalculatorDrawer({
  isOpen,
  onClose,
  onPlotFunction,
  initialExpr = "",
  theme = "light",
}: MathCalculatorDrawerProps) {
  const [expr, setExpr] = useState(initialExpr || "(x - 2)^2 + 1");
  const [prevInitialExpr, setPrevInitialExpr] = useState(initialExpr);
  const [tab, setTab] = useState<CalculatorTab>("standard");
  const [plotSuccess, setPlotSuccess] = useState(false);
  const [plotError, setPlotError] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial expression during render when prop changes
  if (initialExpr !== prevInitialExpr) {
    setPrevInitialExpr(initialExpr);
    if (initialExpr && initialExpr.trim()) {
      setExpr(initialExpr.trim());
    }
  }

  // Live evaluation of current expression
  const evalResult = evaluateCalculatorExpression(expr);

  const insertText = useCallback((text: string, cursorOffset: number = 0) => {
    const input = inputRef.current;
    if (!input) {
      setExpr((prev) => prev + text);
      return;
    }

    const start = input.selectionStart ?? expr.length;
    const end = input.selectionEnd ?? expr.length;
    const before = expr.slice(0, start);
    const after = expr.slice(end);

    const nextExpr = before + text + after;
    setExpr(nextExpr);

    // Reposition cursor
    const nextCursor = start + text.length + cursorOffset;
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(nextCursor, nextCursor);
    });
  }, [expr]);

  const handleBackspace = () => {
    const input = inputRef.current;
    if (!input) {
      setExpr((prev) => prev.slice(0, -1));
      return;
    }

    const start = input.selectionStart ?? expr.length;
    const end = input.selectionEnd ?? expr.length;

    if (start !== end) {
      const nextExpr = expr.slice(0, start) + expr.slice(end);
      setExpr(nextExpr);
      requestAnimationFrame(() => {
        input.setSelectionRange(start, start);
      });
      return;
    }

    if (start > 0) {
      const nextExpr = expr.slice(0, start - 1) + expr.slice(start);
      setExpr(nextExpr);
      requestAnimationFrame(() => {
        input.setSelectionRange(start - 1, start - 1);
      });
    }
  };

  const handleClear = () => {
    setExpr("");
    inputRef.current?.focus();
  };

  const handlePlot = () => {
    if (!expr.trim()) return;
    const valid = compileCustomExpression(expr);
    if (valid) {
      onPlotFunction(expr);
      setPlotSuccess(true);
      setPlotError(false);
      setTimeout(() => setPlotSuccess(false), 2400);
    } else {
      setPlotError(true);
      setTimeout(() => setPlotError(false), 2200);
    }
  };

  const handleEvaluate = () => {
    if (evalResult.success && !evalResult.isFunction && evalResult.result !== undefined) {
      setExpr(String(evalResult.result));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`math-calculator-panel theme-${theme}`}
      role="dialog"
      aria-label="Интерактивный научный калькулятор"
    >
      {/* Header */}
      <div className="math-calc-header">
        <div className="math-calc-title">
          <Calculator size={16} className="calc-accent-icon" />
          <span>Калькулятор</span>
        </div>
        <div className="math-calc-header-actions">
          <button
            type="button"
            onClick={() => setShowKeypad((v) => !v)}
            className={`math-calc-header-btn ${showKeypad ? "active" : ""}`}
            title={showKeypad ? "Скрыть экранные кнопки" : "Показать экранные кнопки"}
            aria-label={showKeypad ? "Скрыть экранные кнопки" : "Показать экранные кнопки"}
          >
            <Keyboard size={14} />
            <span className="math-calc-btn-label">{showKeypad ? "Скрыть" : "Кнопки"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="math-calc-close-btn"
            aria-label="Закрыть калькулятор"
            title="Закрыть (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Screen / Formula Display */}
      <div className="math-calc-screen">
        <div className="math-calc-input-row">
          <span className="math-calc-fx-badge">f(x) =</span>
          <input
            ref={inputRef}
            type="text"
            className="math-calc-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="Введите формулу, например: (x - 2)^2 + 1"
            aria-label="Формула функции f(x)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePlot();
              } else if (e.key === "Escape") {
                if (showKeypad) {
                  setShowKeypad(false);
                } else {
                  onClose();
                }
              }
            }}
          />
        </div>

        {/* Evaluation Output Bar */}
        <div className="math-calc-output-bar">
          {evalResult.success ? (
            evalResult.isFunction ? (
              <span className="math-calc-output function-ready">
                <TrendingUp size={13} />
                <span>Готово &bull; f(1) = {evalResult.result}</span>
              </span>
            ) : (
              <span className="math-calc-output number-eval">
                <Equal size={13} />
                <strong>{evalResult.result}</strong>
              </span>
            )
          ) : (
            <span className={`math-calc-output calc-hint ${plotError ? "calc-error" : ""}`}>
              {plotError
                ? "Некорректная формула"
                : expr.trim()
                  ? "Неполное выражение"
                  : "Введите выражение или функцию от x"}
            </span>
          )}

          {/* Quick Plot CTA */}
          <button
            type="button"
            onClick={handlePlot}
            className={`math-calc-plot-btn ${plotSuccess ? "success" : ""}`}
            title="Отобразить данную функцию на декартовом графике"
          >
            {plotSuccess ? (
              <>
                <Check size={14} />
                <span>Построено!</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Построить</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dedicated Keypad Toggle Strip */}
      <div className="math-calc-keypad-toggle-bar">
        <button
          type="button"
          className={`math-calc-keypad-toggle-pill ${showKeypad ? "active" : ""}`}
          onClick={() => setShowKeypad((prev) => !prev)}
          aria-expanded={showKeypad}
        >
          <Keyboard size={14} />
          <span>{showKeypad ? "Скрыть экранные кнопки" : "Показать кнопки"}</span>
          {showKeypad ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className="math-calc-mode-hint">
          {showKeypad ? "Кнопки открыты" : "Только клавиатура"}
        </span>
      </div>

      {/* Conditionally rendered keypad (tabs + buttons + footer) */}
      {showKeypad && (
        <div className="math-calc-keypad-wrapper">
          {/* Category Tabs */}
          <div className="math-calc-tabs">
            <button
              className={`math-calc-tab ${tab === "standard" ? "active" : ""}`}
              onClick={() => setTab("standard")}
            >
              Основное
            </button>
            <button
              className={`math-calc-tab ${tab === "trig" ? "active" : ""}`}
              onClick={() => setTab("trig")}
            >
              Тригонометрия
            </button>
            <button
              className={`math-calc-tab ${tab === "scientific" ? "active" : ""}`}
              onClick={() => setTab("scientific")}
            >
              Степени и ln
            </button>
            <button
              className={`math-calc-tab ${tab === "presets" ? "active" : ""}`}
              onClick={() => setTab("presets")}
            >
              Примеры
            </button>
          </div>

          {/* Keypad Grid Body */}
          <div className="math-calc-body">
        {tab === "standard" && (
          <div className="math-calc-grid basic-grid">
            <button className="calc-btn fn-btn" onClick={() => insertText("x")}>x</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("(", 0)}>(</button>
            <button className="calc-btn fn-btn" onClick={() => insertText(")", 0)}>)</button>
            <button className="calc-btn clear-btn" onClick={handleClear}>AC</button>
            <button className="calc-btn del-btn" onClick={handleBackspace}><Delete size={15} /></button>

            <button className="calc-btn fn-btn" onClick={() => insertText("^2")}>x²</button>
            <button className="calc-btn num-btn" onClick={() => insertText("7")}>7</button>
            <button className="calc-btn num-btn" onClick={() => insertText("8")}>8</button>
            <button className="calc-btn num-btn" onClick={() => insertText("9")}>9</button>
            <button className="calc-btn op-btn" onClick={() => insertText(" / ")}>&divide;</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("^3")}>x³</button>
            <button className="calc-btn num-btn" onClick={() => insertText("4")}>4</button>
            <button className="calc-btn num-btn" onClick={() => insertText("5")}>5</button>
            <button className="calc-btn num-btn" onClick={() => insertText("6")}>6</button>
            <button className="calc-btn op-btn" onClick={() => insertText(" * ")}>&times;</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("sqrt()", -1)}>&radic;x</button>
            <button className="calc-btn num-btn" onClick={() => insertText("1")}>1</button>
            <button className="calc-btn num-btn" onClick={() => insertText("2")}>2</button>
            <button className="calc-btn num-btn" onClick={() => insertText("3")}>3</button>
            <button className="calc-btn op-btn" onClick={() => insertText(" - ")}>&minus;</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("abs()", -1)}>|x|</button>
            <button className="calc-btn num-btn" onClick={() => insertText("0")}>0</button>
            <button className="calc-btn num-btn" onClick={() => insertText(".")}>.</button>
            <button className="calc-btn eq-btn" onClick={handleEvaluate}>=</button>
            <button className="calc-btn op-btn" onClick={() => insertText(" + ")}>+</button>
          </div>
        )}

        {tab === "trig" && (
          <div className="math-calc-grid trig-grid">
            <button className="calc-btn fn-btn" onClick={() => insertText("sin()", -1)}>sin(x)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("cos()", -1)}>cos(x)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("tan()", -1)}>tan(x)</button>
            <button className="calc-btn const-btn" onClick={() => insertText("pi")}>&pi;</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("arcsin()", -1)}>arcsin</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("arccos()", -1)}>arccos</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("arctan()", -1)}>arctan</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("cot()", -1)}>cot(x)</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("sinh()", -1)}>sinh(x)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("cosh()", -1)}>cosh(x)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("tanh()", -1)}>tanh(x)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("sec()", -1)}>sec(x)</button>

            <button className="calc-btn num-btn" onClick={() => insertText("x")}>x</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("2*")}>2&times;</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("csc()", -1)}>csc(x)</button>
            <button className="calc-btn del-btn" onClick={handleBackspace}><Delete size={15} /></button>
          </div>
        )}

        {tab === "scientific" && (
          <div className="math-calc-grid sci-grid">
            <button className="calc-btn fn-btn" onClick={() => insertText("ln()", -1)}>ln(x)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("log10()", -1)}>log₁₀</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("log2()", -1)}>log₂</button>
            <button className="calc-btn const-btn" onClick={() => insertText("e")}>e</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("exp()", -1)}>eˣ (exp)</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("10^")}>10ˣ</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("^", 0)}>xʸ (^)</button>
            <button className="calc-btn const-btn" onClick={() => insertText("phi")}>&phi; (1.618)</button>

            <button className="calc-btn fn-btn" onClick={() => insertText("cbrt()", -1)}>∛x</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("sqrt()", -1)}>&radic;x</button>
            <button className="calc-btn fn-btn" onClick={() => insertText("1/x")}>1/x</button>
            <button className="calc-btn clear-btn" onClick={handleClear}>AC</button>
          </div>
        )}

        {tab === "presets" && (
          <div className="math-calc-presets-list">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.expr}
                className="math-calc-preset-item"
                onClick={() => {
                  setExpr(p.expr);
                  onPlotFunction(p.expr);
                  setPlotSuccess(true);
                  setTimeout(() => setPlotSuccess(false), 2000);
                }}
              >
                <div className="preset-item-info">
                  <span className="preset-name">{p.label}</span>
                  <code className="preset-code">{p.expr}</code>
                </div>
                <ArrowRight size={14} className="preset-arrow" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="math-calc-footer">
        <span>Поддерживает: x, sin, cos, tan, exp, ln, sqrt, abs, степени ^, скобки, константы pi, e.</span>
      </div>
        </div>
      )}
    </div>
  );
}
