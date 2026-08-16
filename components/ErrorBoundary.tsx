"use client";

import { Component, type ReactNode } from "react";

// React error boundaries have to be class components — there's still no hook equivalent in
// React 18. This wraps a specific widget (the demo's canvas, the leaderboard section) instead
// of relying only on the root error.tsx, so a crash in one part of the page (e.g. a canvas
// rendering bug) doesn't take down navigation, the footer, or anything else already on screen.
type Props = { children: ReactNode; fallback: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    console.error("[refugio-wall] widget crashed", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
