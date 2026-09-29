"use client";

import { useEffect } from "react";
import { captureFirstTouch } from "@/lib/utm";

export function UtmCapture() {
  useEffect(() => {
    captureFirstTouch(window.localStorage, {
      search: window.location.search,
      pathname: window.location.pathname,
      referrer: document.referrer,
    });
  }, []);

  return null;
}
