/**
 * useFormFields Hook
 *
 * Returns an array of form field configurations based on the current page (slug).
 * Each field config includes translated labels and placeholders from the
 * translation dictionary, making forms fully internationalized.
 *
 * Usage: const fields = useFormFields({ slug: Pages.LOGIN, translation });
 * The returned fields can be mapped to <FormFields /> components.
 */
import { Pages } from "@/constants/enums";
import { IFormField, IFormFieldsVariables } from "@/types/app";
import { Translations } from "@/types/translations";

interface props extends IFormFieldsVariables {
  translation: Translations;
}

export const useFormFields = ({ slug, translation }: props) => {
  // Login form fields with translated labels and placeholders
  const loginFields: IFormField[] = [
    {
      name: "email",
      label: translation.auth.login.email.label,
      type: "email",
      placeholder: translation.auth.login.email.placeholder,
    },
    {
      name: "password",
      label: translation.auth.login.password.label,
      type: "password",
      placeholder: translation.auth.login.password.placeholder,
    },
  ];

  const signupFields: IFormField[] = [
    {
      name: "name",
      label: translation.auth.register.name.label,
      type: "text",
      placeholder: translation.auth.register.name.placeholder,
    },
    {
      name: "email",
      label: translation.auth.register.email.label,
      type: "email",
      placeholder: translation.auth.register.email.placeholder,
    },
    {
      name: "password",
      label: translation.auth.register.password.label,
      type: "password",
      placeholder: translation.auth.register.password.placeholder,
    },
    {
      name: "confirmPassword",
      label: translation.auth.register.confirmPassword.label,
      type: "password",
      placeholder: translation.auth.register.confirmPassword.placeholder,
    },
  ];

  /**
   * Returns the appropriate field configuration array based on page slug.
   * Add new cases here when adding forms for other pages (e.g., register).
   */
  const getFormFields = (): IFormField[] => {
    switch (slug) {
      case Pages.LOGIN:
        return loginFields;
      case Pages.Register:
        return signupFields;
      default:
        return [];
    }
  };
  return getFormFields();
};
