export interface DraftField {
  name: string;
  type: "boolean" | "choice";
  choices?: string[];
}