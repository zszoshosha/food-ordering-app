/**
 * Application Type Definitions
 *
 * Shared types used across the application for form handling.
 * These types power the dynamic form field system (useFormFields + FormFields).
 */

/** Option type for select/radio inputs */
export interface IOption {
  label: string;
  value: string;
}

/** Configuration for a single form field (used by FormFields component) */
export interface IFormField {
  name: string;
  label?: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "time"
    | "datetime-local"
    | "checkbox"
    | "radio"
    | "select"
    | "hidden"
    | "textarea";
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  options?: IOption;
  id?: string;
  defaultValue?: string;
  readOnly?: boolean;
  error?: Record<string, string | string[] | undefined>;
}
export interface IFormFieldsVariables {
  slug: string;
}
