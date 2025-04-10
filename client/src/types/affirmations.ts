export interface CountItem {
  text: string;
  count: number;
  target: number;
  completed: boolean;
}

export interface AffirmationCounterProps {
  transcript: string;
  selectedDate?: string; // Optional date in YYYY-MM-DD format
  onSave?: (positiveAffirmations: CountItem[], negativeWords: CountItem[]) => void;
  readOnly?: boolean; // For viewing history
} 