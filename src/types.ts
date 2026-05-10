export interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: string;
  sentimentScore: number;
}

export interface CoachingCardData {
  pros: string[];
  cons: string[];
}

export interface AnalysisResult {
  transcript: TranscriptLine[];
  coachingCard: CoachingCardData;
}
