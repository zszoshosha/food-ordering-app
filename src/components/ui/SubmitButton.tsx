"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

type SubmitButtonProps = {
  text: string;
  loadingText?: string;
  className?: string;
};

/**
 * A standard submit button component that automatically uses React 19's `useFormStatus`
 * to detect pending states and disable/display loader when wrapping action starts.
 */
export function SubmitButton({
  text,
  loadingText = "Loading...",
  className = "w-full mt-4",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={className} size="lg">
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        text
      )}
    </Button>
  );
}
