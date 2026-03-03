interface ReviewsSectionProps {
  reviews: string[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps): JSX.Element {
  return (
    <section className="space-y-3">
      <h3 className="font-serif text-2xl tracking-wide text-foreground">
        Sample Audience Reviews
      </h3>
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <article
            key={`${review.slice(0, 24)}-${index.toString()}`}
            className="rounded-card border border-border bg-card/75 p-4 text-sm text-muted-foreground"
          >
            <p className="leading-relaxed">&quot;{review}&quot;</p>
          </article>
        ))}
      </div>
    </section>
  );
}
