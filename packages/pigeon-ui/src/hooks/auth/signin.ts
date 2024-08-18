import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { RequestError } from "pigeon-sdk";
import { signInSchema } from "../../schemas/sign-in";
import { ClientAuthProps } from "pigeon-sdk/src/client";
import { connectSocket } from "../../redux/slices/socket";
import { useEffect } from "react";

export default function useSignIn({ onLogin }: { onLogin: () => void }) {
  const sdk = useSelector((state: RootState) => state.sdk.value);
  const socket = useSelector((state: RootState) => state.socket.value);
  const dispatch = useDispatch();

  const form = useForm<ClientAuthProps>({
    resolver: yupResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<ClientAuthProps> = async (credentials) => {
    await sdk.client
      .authenticate(credentials)
      .then(() => {
        dispatch(connectSocket(sdk.client.accessToken));
      })
      .catch((err: RequestError) => {
        form.setError("root", { message: err.body.message });
      });
  };

  useEffect(() => {
    function onConnect() {
      onLogin();
    }
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, []);

  return { form, onSubmit };
}
