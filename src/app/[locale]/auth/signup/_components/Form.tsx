"use client";
import { FormFields } from "@/components/form-fields/FormFields";
import { Button } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import { useFormFields } from "@/hooks/useFormFields";
import { signup, type SignupState } from "@/server/Actions/Auth";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import { useParams, useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initialState: SignupState = {
  errors: {},
  formdata: new FormData(),
};

/**
 * Sign-up form wired to the server action and localized field metadata.
 */
function Form({ translation }: { translation: Translations }) {
  const route = useRouter();
  const { locale } = useParams();
  const localeValue =
    typeof locale === "string"
      ? locale
      : Array.isArray(locale)
        ? locale[0]
        : "en";
  const localeRef = useRef(localeValue);
  const [state, action, pending] = useActionState<SignupState, FormData>(
    signup,
    initialState,
  );
  const getformFields = useFormFields({
    slug: Pages.REGISTER,
    translation,
  });
  useEffect(() => {
    if (state.status && state.message) {
      toast(state.message, {
        className:
          state.status === 201
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white",
      });
    }
    if (state.status === 201) {
      route.replace(`/${localeRef.current}/${Routes.AUTH}/${Pages.LOGIN}`);
    }
  }, [state, route]);
  return (
    <form action={action}>
      {getformFields.map((field: IFormField) => {
        const fieldsValue = state.formdata?.get(field.name) as string;
        return (
          <div key={field.name}>
            <FormFields
              {...field}
              error={state.errors}
              defaultValue={fieldsValue}
            />
          </div>
        );
      })}
      <SubmitButton
        text={translation.auth.register.submit}
        loadingText="Registering..."
        className="w-full mt-4"
      />
    </form>
  );
}

export default Form;
