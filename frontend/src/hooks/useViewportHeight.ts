import { useEffect } from "react";

// Keeps a CSS custom property (--app-height) in sync with the REAL visible viewport — the one
// that shrinks when the on-screen keyboard opens. dvh/vh units don't reliably track the
// on-screen keyboard across mobile browsers (some resize for it, some don't, some do it late),
// which is exactly why the chat page was leaving dead space with the keyboard closed and a gap
// above the keyboard when it was open. visualViewport is the actual browser API for "how much
// space is visible right now," keyboard included, so this is the correct fix rather than a
// different guessed constant.
export function useViewportHeight() {
  useEffect(() => {
    function setHeight() {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    }
    setHeight();
    window.visualViewport?.addEventListener("resize", setHeight);
    window.addEventListener("resize", setHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", setHeight);
      window.removeEventListener("resize", setHeight);
    };
  }, []);
}