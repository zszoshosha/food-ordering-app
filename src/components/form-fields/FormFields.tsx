/**
 * FormFields Component
 *
 * A dynamic form field renderer that selects the appropriate input component
 * based on the field type. Acts as a factory/dispatcher:
 * - email / text → TextField
 * - password → PasswordField (with show/hide toggle)
 * - checkbox → Checkbox
 * - default fallback → TextField
 *
 * Used with useFormFields hook to render internationalized form fields.
 */
import { InputTypes } from "@/constants/enums";
import { IFormField } from "@/types/app";
import PasswordField from "./PasswordField";
import TextField from "./TextField";
import Checkbox from "./Checkbox";

interface props extends IFormField {}
export const FormFields = (props: props) => {
  const { type } = props;

  // Select the correct input component based on field type
  const renderField = (): React.ReactNode => {
    if (type === InputTypes.EMAIL || type === InputTypes.TEXT) {
      return <TextField {...props} />;
    }

    if (type === InputTypes.PASSWORD) {
      return <PasswordField {...props} />;
    }

    if (type === InputTypes.CHECKBOX) {
      return <Checkbox {...props} />;
    }

    // Fallback to text field for unrecognized types
    return <TextField {...props} />;
  };

  return <>{renderField()}</>;
};
