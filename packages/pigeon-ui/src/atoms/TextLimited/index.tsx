import { ReactNode } from "react";

export default function TextLimited({
  text,
  length,
  render,
}: {
  text: string;
  length: number;
  render: (str: string) => ReactNode;
}) {
  return render(
    text.length > length ? text.substring(0, length) + "..." : text
  );
}
