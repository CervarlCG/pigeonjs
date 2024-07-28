import { TransformFnParams } from 'class-transformer';

export default function TrimTransformer({ value }: TransformFnParams) {
  return value.trim();
}
