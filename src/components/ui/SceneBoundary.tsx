"use client";
import { Component, type ReactNode } from "react";

/** Keep HTML navigation usable if WebGL initialization fails. */
export class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("3D Scene Error:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
