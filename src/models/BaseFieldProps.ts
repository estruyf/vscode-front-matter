

export interface BaseFieldProps<T> {
  label: string;
  value: T | null;
  description?: string;
  required?: boolean;
}