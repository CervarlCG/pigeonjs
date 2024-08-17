import { FieldErrors } from "react-hook-form";
import { capitalize } from "./string";

export function getFormSingleError(errors: FieldErrors) {
  return capitalize(
    errors[
      Object.keys(errors)[0] as keyof typeof errors
    ]?.message?.toString() || ""
  );
}
