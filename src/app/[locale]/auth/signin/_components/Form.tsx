"use client";

/**
 * Sign-In Form Component
 *
 * Renders the login form with internationalized field labels and placeholders.
 * Receives translations from the server-side parent page and passes them to
 * the useFormFields hook, which generates the field configs for the login page.
 *
 * Each field is rendered using the FormFields component (dynamic field renderer).
 */
import { FormFields } from "@/components/form-fields/FormFields";
import { Button } from "@/components/ui/button";
import { Pages } from "@/constants/enums";
import { useFormFields } from "@/hooks/useFormFields";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";

function Form({ translations }: { translations: Translations }) {
  // Generate form fields with translated labels based on the login page slug
  const formFields = useFormFields({
    slug: Pages.LOGIN,
    translation: translations,
  });

  return (
    <form>
      {/* Map each field config to the appropriate input component */}
      {formFields.map((field: IFormField) => (
        <div key={field.name} className="w-full">
          <FormFields {...field} />
        </div>
      ))}
      <Button type="submit" className="w-full" size="lg">
        login
      </Button>
    </form>
  );
}

export default Form;
