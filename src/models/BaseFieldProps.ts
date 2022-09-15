

export interface BaseFieldProps<T> {
  label: string;
  value: T | null;
  required?: boolean;
}