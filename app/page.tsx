import { CTASection } from "@/components/ui/hero-dithering-card";

export default function HomePage(): JSX.Element {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="grain" aria-hidden />
      <CTASection />
    </main>
  );
}
