export function generateCopilotInsights(matches) {
  if (!matches?.length) return [];

  const highMatches = matches.filter(
    m => (m.score?.overall_score || 0) >= 80
  );

  const lowMatches = matches.filter(
    m => (m.score?.overall_score || 0) < 60
  );

  return [
    `${highMatches.length} high-potential matches available`,
    `${lowMatches.length} profiles may need manual review`,
    `Top compatibility score: ${
      Math.max(...matches.map(
        m => m.score?.overall_score || 0
      ))
    }%`,
    `AI recommends prioritizing profiles above 80%`
  ];
}