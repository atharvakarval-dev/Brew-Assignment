"use client";

import { useEffect, useState } from "react";

import { telemetry, type TelemetryData } from "@/lib/telemetry";

interface PerformanceOverlayProps {
  imdbId: string;
}

export function PerformanceOverlay({ imdbId }: PerformanceOverlayProps): JSX.Element | null {
  const [metrics, setMetrics] = useState<TelemetryData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMetrics = () => {
      const data = telemetry.getMetrics(imdbId);
      if (data) {
        setMetrics(data);
      }
    };

    checkMetrics();
    const interval = window.setInterval(checkMetrics, 500);
    return () => {
      window.clearInterval(interval);
    };
  }, [imdbId]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "p" && event.ctrlKey) {
        event.preventDefault();
        setIsVisible((previousValue) => !previousValue);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  if (process.env.NODE_ENV !== "development" || !metrics || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-border bg-card/95 p-3 text-xs font-mono backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-primary">Performance</span>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground transition duration-150 hover:text-foreground"
        >
          x
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className="text-green-400">{metrics.ttfb.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Movie API:</span>
          <span className="text-blue-400">{metrics.movieApiDuration.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>AI Analysis:</span>
          <span className="text-purple-400">{metrics.aiDuration.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1">
          <span>Total:</span>
          <span className="text-orange-400">{metrics.totalDuration.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Cache:</span>
          <span className={metrics.cacheHit ? "text-green-400" : "text-red-400"}>
            {metrics.cacheHit ? "HIT" : "MISS"}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">Press Ctrl+P to toggle</div>
    </div>
  );
}
