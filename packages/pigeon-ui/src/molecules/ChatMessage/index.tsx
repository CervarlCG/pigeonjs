import { Avatar, Flex, Space, Typography } from "antd";
import { Message } from "pigeon-types/entities/message";
import { UserOutlined } from "@ant-design/icons";
import { getDateAgo } from "../../utils/date";
import styles from "./styles.module.scss";

export default function ChatMessage({ message }: { message: Message }) {
  return (
    <Flex className={styles.message} gap={16}>
      <Avatar>
        <UserOutlined />
      </Avatar>
      <Space direction="vertical">
        <Space>
          <Typography.Title level={5} className={styles["name"]}>
            {" "}
            {message.user.firstName} {message.user.lastName}{" "}
          </Typography.Title>
          <Typography.Text className={styles["date"]}>
            {getDateAgo(new Date(message.createdAt))}
          </Typography.Text>
        </Space>
        <Typography.Paragraph>{message.content}</Typography.Paragraph>
      </Space>
    </Flex>
  );
}
