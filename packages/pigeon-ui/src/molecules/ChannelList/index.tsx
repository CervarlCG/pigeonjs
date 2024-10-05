import { Avatar, Typography } from "antd";
import ChannelItem, { ChannelItemProps } from "./item";
import { NumberOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import { Channel } from "pigeon-types/entities";

export default function ChannelList({
  title,
  items,
  onClick,
}: {
  title: string;
  items: ChannelItemProps[];
  onClick: (channel: Channel) => void;
}) {
  return (
    <div className={styles["list"]}>
      <Typography.Title level={5}>{title}</Typography.Title>
      {items.map((item) => (
        <ChannelItem
          {...item}
          onClick={onClick}
          key={item.channel.id}
          avatar={
            <Avatar shape="square" size="small" className={styles["avatar"]}>
              <NumberOutlined />
            </Avatar>
          }
        />
      ))}
    </div>
  );
}
