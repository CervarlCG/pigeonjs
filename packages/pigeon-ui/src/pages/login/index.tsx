import useSignIn from "../../hooks/auth/signin";
import { Button, Input, Space, Typography, Alert } from "antd";
import { Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getFormSingleError } from "../../utils/form";
import CardPage from "../../templates/CardPage";

export default function LoginPage() {
  const navigate = useNavigate();
  const { form, onSubmit } = useSignIn({
    onLogin: () => navigate("/"),
  });
  const error = getFormSingleError(form.formState.errors);

  return (
    <CardPage>
      <Typography.Title level={1} className="text-center m-0">
        Sign In
      </Typography.Title>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Space direction="vertical" size="middle" className="width-full">
          {error && <Alert type="error" message={error} />}
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <Input type="email" placeholder="Email" {...field} />
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <Input.Password
                type="password"
                placeholder="Password"
                {...field}
              />
            )}
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={form.formState.isSubmitting}
            block
          >
            Sign In
          </Button>
        </Space>
      </form>
    </CardPage>
  );
}
