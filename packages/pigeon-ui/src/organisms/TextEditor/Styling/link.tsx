import { Popover, Input, Space, Button, Flex } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import {
  useForm,
  Controller,
  UseFormReturn,
  SubmitHandler,
} from "react-hook-form";
import styles from "./styles.module.scss";
import { PropsWithChildren, useEffect, useState } from "react";
import { CreateLinkFunction } from "../../../hooks/text-editor";

export function LinkStyling({
  createLink,
}: {
  createLink: CreateLinkFunction;
}) {
  const form = useForm();
  const handleSubmit = (data: any) => {
    createLink(data);
  };

  return (
    <LinkForm form={form} handleSubmit={handleSubmit}>
      <button>
        <LinkOutlined />
      </button>
    </LinkForm>
  );
}

export function LinkForm({
  form,
  children,
  handleSubmit,
}: PropsWithChildren & {
  form: UseFormReturn<any>;
  handleSubmit: SubmitHandler<any>;
}) {
  return (
    <Popover
      trigger="click"
      onOpenChange={(open) => !open && form.reset()}
      content={
        <form
          className={styles["form"]}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Space direction="vertical">
            <Controller
              name="text"
              control={form.control}
              render={({ field }) => (
                <Input type="text" placeholder="Text" {...field} size="small" />
              )}
            />
            <Controller
              name="url"
              control={form.control}
              render={({ field }) => (
                <Input type="text" placeholder="URL" {...field} size="small" />
              )}
            />
            <Flex justify="end">
              <Button htmlType="submit" type="primary" size="small">
                Create
              </Button>
            </Flex>
          </Space>
        </form>
      }
    >
      {children}
    </Popover>
  );
}
