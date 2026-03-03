import React from "react";

function formatReviewText(text: string): JSX.Element {
  // Handle multiple markdown patterns: ***bold***, **bold**, *italic*, _italic_, __bold__
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/);
  
  return (
    <>
      {parts.map((part, index) => {
        // Bold and italic with triple asterisks
        if (part.startsWith('***') && part.endsWith('***')) {
          const text = part.slice(3, -3);
          return <strong key={index}><em>{text}</em></strong>;
        }
        // Bold with double asterisks
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={index}>{boldText}</strong>;
        }
        // Bold with double underscores
        if (part.startsWith('__') && part.endsWith('__')) {
          const boldText = part.slice(2, -2);
          return <strong key={index}>{boldText}</strong>;
        }
        // Italic with single asterisk
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          const italicText = part.slice(1, -1);
          return <em key={index}>{italicText}</em>;
        }
        // Italic with single underscore
        if (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__')) {
          const italicText = part.slice(1, -1);
          return <em key={index}>{italicText}</em>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

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
            <p className="leading-relaxed">&quot;{formatReviewText(review)}&quot;</p>
          </article>
        ))}
      </div>
    </section>
  );
}
