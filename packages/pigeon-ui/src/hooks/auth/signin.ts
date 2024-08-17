import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { RequestError } from "pigeon-sdk";
import { signInSchema } from "../../schemas/sign-in";
import { ClientAuthProps } from "pigeon-sdk/src/client";

export default function useSignIn({ onLogin }: { onLogin: () => void }) {
  const sdk = useSelector((state: RootState) => state.sdk.value);
  const form = useForm<ClientAuthProps>({
    resolver: yupResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<ClientAuthProps> = async (credentials) => {
    await sdk.client
      .authenticate(credentials)
      .then(() => onLogin())
      .catch((err: RequestError) => {
        form.setError("root", { message: err.body.message });
      });
  };

  return { form, onSubmit };
}
