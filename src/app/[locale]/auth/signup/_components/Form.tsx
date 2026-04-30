"use client";
import { FormFields } from "@/components/form-fields/FormFields";
import { Button } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import { useFormFields } from "@/hooks/useFormFields";
import { signup, type SignupState } from "@/server/Actions/Auth";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import { useParams, useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: SignupState = {
  errors: {},
  formdata: new FormData(),
};

function Form({ translation }: { translation: Translations }) {
  const route = useRouter();
  const { locale } = useParams();
  const [state, action, pending] = useActionState<SignupState, FormData>(
    signup,
    initialState,
  );
  const getformFields = useFormFields({
    slug: Pages.Register,
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
      route.replace(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
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
      <Button
        type="submit"
        disabled={pending}
        className="w-full padding-0 mt-4 "
        size="lg"
      >
        {translation.auth.register.submit}
      </Button>
    </form>
  );
}

export default Form;
