"use client";
import { Component, createRef, type ReactNode } from "react";

/** Keep HTML navigation usable if WebGL initialization fails or context is lost. */
export class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean; contextLost: boolean; resetKey: number }
> {
  state = { failed: false, contextLost: false, resetKey: 0 };
  private containerRef = createRef<HTMLDivElement>();
  private cleanup?: () => void;

  static getDerivedStateFromError() {
    return { failed: true, contextLost: false };
  }

  componentDidCatch(error: unknown) {
    console.error("3D Scene Error:", error);
  }

  componentDidMount() {
    this.attachListeners();
  }

  componentDidUpdate(_prevProps: unknown, prevState: { resetKey: number }) {
    if (prevState.resetKey !== this.state.resetKey) {
      this.cleanup?.();
      this.attachListeners();
    }
  }

  private attachListeners() {
    const container = this.containerRef.current;
    if (!container) return;

    const handleContextLost = (event: Event) => {
      // Calling preventDefault is required by WebGL spec to allow context restoration
      event.preventDefault();
      console.warn("WebGL context lost detected in SceneBoundary");
      this.setState({ contextLost: true });
    };

    const handleContextRestored = () => {
      console.info("WebGL context restored in SceneBoundary");
      this.setState((s) => ({
        contextLost: false,
        failed: false,
        resetKey: s.resetKey + 1,
      }));
    };

    container.addEventListener("webglcontextlost", handleContextLost, true);
    container.addEventListener("webglcontextrestored", handleContextRestored, true);

    this.cleanup = () => {
      container.removeEventListener("webglcontextlost", handleContextLost, true);
      container.removeEventListener("webglcontextrestored", handleContextRestored, true);
    };
  }

  componentWillUnmount() {
    this.cleanup?.();
  }

  private handleRetry = () => {
    this.setState((s) => ({
      failed: false,
      contextLost: false,
      resetKey: s.resetKey + 1,
    }));
  };

  render() {
    if (this.state.failed) {
      return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {this.props.fallback}
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              onClick={this.handleRetry}
            >
              Retry 3D view
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={this.containerRef}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <div
          key={this.state.resetKey}
          style={{ width: "100%", height: "100%" }}
        >
          {this.props.children}
        </div>
        {this.state.contextLost && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              padding: "1rem",
            }}
          >
            {this.props.fallback}
            <button
              type="button"
              className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
              onClick={this.handleRetry}
            >
              Restore 3D view
            </button>
          </div>
        )}
      </div>
    );
  }
}
