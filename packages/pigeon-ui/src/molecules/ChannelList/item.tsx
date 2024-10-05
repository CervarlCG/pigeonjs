import { Badge, Flex, Space, Typography } from "antd";
import { ReactNode } from "react";
import styles from "./styles.module.scss";
import { Channel } from "pigeon-types/entities";

export interface ChannelItemProps {
  avatar?: ReactNode;
  channel: Channel;
  notifications?: number;
  onClick?: (channel: Channel) => void;
}

export default function ChannelItem(props: ChannelItemProps) {
  return (
    <Flex
      justify="space-between"
      className={styles["item"]}
      onClick={() => props.onClick && props.onClick(props.channel)}
    >
      <Space>
        {props.avatar}
        <Typography.Text>{props.channel.name}</Typography.Text>
      </Space>
      <Flex align="center">
        <Badge
          count={props.notifications}
          overflowCount={99}
          classNames={{
            root: styles["badge"],
            indicator: styles["badge-indicator"],
          }}
        ></Badge>
      </Flex>
    </Flex>
  );
}
