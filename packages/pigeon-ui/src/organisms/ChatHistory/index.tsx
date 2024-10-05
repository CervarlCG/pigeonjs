import { Message } from "pigeon-types/entities/message";
import ChatMessage from "../../molecules/ChatMessage";
import { Flex, Space } from "antd";
import TextEditor from "../TextEditor";

export default function ChatHistory({ messages }: { messages: Message[] }) {
  return (
    <Flex
      vertical
      className="width-full height-full"
      gap={16}
      justify="space-between"
    >
      <div>
        {messages.map((message) => (
          <ChatMessage message={message} />
        ))}
      </div>

      <TextEditor />
    </Flex>
  );
}
