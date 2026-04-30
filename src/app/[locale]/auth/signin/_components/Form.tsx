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
import { Pages, Routes } from "@/constants/enums";
import { useFormFields } from "@/hooks/useFormFields";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import { Loader2, Route } from "lucide-react";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useState } from "react";
import { toast } from "sonner";

function Form({ translations }: { translations: Translations }) {
  // Generate form fields with translated labels based on the login page slug
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const route = useRouter();
  const { locale } = useParams();
  const formFields = useFormFields({
    slug: Pages.LOGIN,
    translation: translations,
  });

  // NextAuth surfaces thrown authorize() errors as strings; decode our JSON payload.
  const getErrorMessage = (rawError: string) => {
    try {
      const parsed = JSON.parse(rawError) as {
        validationError?: Record<string, string | string[]>;
        responseError?: string;
      };

      if (parsed.responseError) return parsed.responseError;

      if (parsed.validationError) {
        const firstError = Object.values(parsed.validationError)[0];
        if (Array.isArray(firstError)) return firstError[0] ?? rawError;
        if (typeof firstError === "string") return firstError;
      }

      return rawError;
    } catch {
      return rawError;
    }
  };

  const onsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!formRef.current) return;

    setIsLoading(true);

    const formData = new FormData(formRef.current);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        toast.error(getErrorMessage(res.error), {
          className: "bg-red-500 text-white",
        });
        return;
      }

      if (res?.ok) {
        toast.success(translations.messages.loginSuccessful, {
          className: "bg-green-500 text-white",
        });
        route.replace(`/${locale}/${Routes.PROFILE}`);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error(translations.messages.unexpectedError, {
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onsubmit} ref={formRef}>
      {/* Map each field config to the appropriate input component */}
      {formFields.map((field: IFormField) => (
        <div key={field.name} className="w-full">
          <FormFields {...field} />
        </div>
      ))}
      <Button
        type="submit"
        className="w-full padding-0 mt-4 "
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </span>
        ) : (
          translations.auth.login.submit
        )}
      </Button>
    </form>
  );
}

export default Form;
