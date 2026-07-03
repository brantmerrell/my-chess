import React, { useCallback, useEffect, useState } from "react";

export type MobileView = "positional" | "historical";

/**
 * Tracks which pane of the horizontally scrollable main content is visible
 * on mobile, and exposes a scroll helper for the swipe indicator buttons.
 */
export function useMobileSwipeView(
  mainContentRef: React.RefObject<HTMLDivElement>,
) {
  const [activeMobileView, setActiveMobileView] =
    useState<MobileView>("positional");

  const handleMainContentScroll = useCallback(() => {
    if (!mainContentRef.current) return;
    const { scrollLeft, clientWidth } = mainContentRef.current;
    const newView = scrollLeft > clientWidth / 2 ? "historical" : "positional";
    setActiveMobileView(newView);
  }, [mainContentRef]);

  const scrollToView = useCallback(
    (view: MobileView) => {
      if (!mainContentRef.current) return;
      const targetScrollLeft =
        view === "positional" ? 0 : mainContentRef.current.clientWidth;
      mainContentRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    },
    [mainContentRef],
  );

  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;
    mainContent.addEventListener("scroll", handleMainContentScroll);
    return () => {
      mainContent.removeEventListener("scroll", handleMainContentScroll);
    };
  }, [mainContentRef, handleMainContentScroll]);

  return { activeMobileView, scrollToView };
}
