import { parseSentimentResponse } from "@/lib/groq";

describe("parseSentimentResponse", () => {
  it("validates correct JSON", () => {
    const rawResponse = JSON.stringify({
      sentiment: "positive",
      score: 88,
      summary:
        "Audiences praised the ambitious storytelling and the emotional throughline. Most viewers felt the action scenes elevated the narrative instead of distracting from it. A minority cited pacing issues, but reception remains strongly favorable.",
      insights: [
        "Visual world-building is a major reason audiences recommend the movie.",
        "Lead performances are frequently highlighted as the emotional anchor.",
        "Pacing concerns are mentioned, mostly around the second act."
      ]
    });

    const parsed = parseSentimentResponse(rawResponse);

    expect(parsed.sentiment).toBe("positive");
    expect(parsed.score).toBe(88);
    expect(parsed.insights).toHaveLength(3);
  });

  it("throws on malformed AI response", () => {
    expect(() => parseSentimentResponse("not-json-response")).toThrow(
      "AI response contained no JSON object."
    );
  });

  it("score is clamped between 0 and 100", () => {
    const highScoreResponse = JSON.stringify({
      sentiment: "mixed",
      score: 143,
      summary:
        "Audience sentiment is split between admiration for technical craft and frustration with narrative complexity. Many appreciate the film's ambition, while others feel detached from the characters.",
      insights: [
        "Production quality receives broad praise from most viewers.",
        "Narrative clarity is the most common criticism across reviews.",
        "The ending improves overall sentiment even among mixed reviews."
      ]
    });

    const lowScoreResponse = JSON.stringify({
      sentiment: "negative",
      score: -20,
      summary:
        "Viewers frequently report that pacing and tonal inconsistency reduced emotional engagement. Performances were occasionally praised, but not enough to offset broader dissatisfaction.",
      insights: [
        "Pacing is the dominant complaint in negative feedback.",
        "Tone shifts are perceived as abrupt and distracting.",
        "A small segment still appreciated select performances."
      ]
    });

    expect(parseSentimentResponse(highScoreResponse).score).toBe(100);
    expect(parseSentimentResponse(lowScoreResponse).score).toBe(0);
  });
});
