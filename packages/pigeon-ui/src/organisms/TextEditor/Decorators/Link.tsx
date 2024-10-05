import { ContentState } from "draft-js";
import { PropsWithChildren, useEffect } from "react";
import { LinkForm } from "../Styling/link";
import { useForm } from "react-hook-form";

export function LinkDecorator({
  contentState,
  entityKey,
  children,
  decoratedText,
}: PropsWithChildren & {
  contentState: ContentState;
  entityKey: string;
  decoratedText: string;
}) {
  const { url, ...rest } = contentState.getEntity(entityKey).getData();
  const form = useForm({
    defaultValues: {
      text: decoratedText,
      url,
    },
  });

  useEffect(() => {
    const { text } = form.getValues();
    if (decoratedText !== text) form.setValue("text", text);
  }, [decoratedText]);

  return (
    <LinkForm form={form} handleSubmit={() => {}}>
      <a href={url} target="_blank">
        {children}
      </a>
    </LinkForm>
  );
}
