interface TelemetryData {
  imdbId: string;
  ttfb: number;
  movieApiDuration: number;
  aiDuration: number;
  totalDuration: number;
  cacheHit: boolean;
  timestamp: number;
}

class Telemetry {
  private static instance: Telemetry;
  private metrics: Map<string, TelemetryData> = new Map();

  static getInstance(): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry();
    }
    return Telemetry.instance;
  }

  startTimer(): number {
    return performance.now();
  }

  endTimer(startTime: number): number {
    return performance.now() - startTime;
  }

  logMetrics(data: TelemetryData): void {
    this.metrics.set(data.imdbId, data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎬 Performance Metrics: ${data.imdbId}`);
      console.log(`  ⚡ TTFB: ${data.ttfb.toFixed(0)}ms`);
      console.log(`  🎭 Movie API: ${data.movieApiDuration.toFixed(0)}ms`);
      console.log(`  🤖 AI Analysis: ${data.aiDuration.toFixed(0)}ms`);
      console.log(`  📊 Total: ${data.totalDuration.toFixed(0)}ms`);
      console.log(`  💾 Cache: ${data.cacheHit ? 'HIT' : 'MISS'}`);
    }
  }

  getMetrics(imdbId: string): TelemetryData | undefined {
    return this.metrics.get(imdbId);
  }

  getAllMetrics(): TelemetryData[] {
    return Array.from(this.metrics.values());
  }
}

export const telemetry = Telemetry.getInstance();
export type { TelemetryData };