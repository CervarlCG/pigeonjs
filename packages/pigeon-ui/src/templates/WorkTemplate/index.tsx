import { Card, Dropdown, MenuProps } from "antd";
import styles from "./styles.module.scss";
import clsx from "clsx";
import ChannelList from "../../molecules/ChannelList";
import { DownOutlined } from "@ant-design/icons";
import {
  mockChannels,
  mockMessages,
  mockUsers,
  mockWorkspaces,
} from "../../mock";
import { useEffect, useState } from "react";
import { Channel } from "pigeon-types/entities";
import ChatHistory from "../../organisms/ChatHistory";
import { useDispatch, useSelector } from "react-redux";
import { initialize, switchWorkspace } from "../../redux/slices/workspace";
import { RootState } from "../../redux/store";

export default function WorkTemplate() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const { channels, messages, workspace, workspaces } = useSelector(
    (state: RootState) => state.workspace
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      initialize({
        workspaces: mockWorkspaces,
        channels: mockChannels,
        messages: mockMessages,
      })
    );
  }, []);

  return (
    <div className={styles["page"]}>
      <div
        className={clsx(styles["card"], styles["w-small"], styles["border"])}
      >
        <Dropdown.Button
          icon={<DownOutlined />}
          menu={{
            items: workspaces.map((workspace) => ({
              label: workspace.name,
              key: workspace.id,
              onClick: () => dispatch(switchWorkspace(workspace.id)),
            })) as MenuProps["items"],
          }}
          className={styles["dropdown"]}
        >
          {workspace?.name}
        </Dropdown.Button>
        <ChannelList
          title="Channels"
          items={channels.map((channel) => ({
            channel,
            notifications: Math.floor(Math.random() * 50),
          }))}
          onClick={setChannel}
        />
      </div>
      <Card
        className={clsx(styles["card"], styles["w-grow"], "height-full")}
        classNames={{ body: clsx("height-full") }}
      >
        <ChatHistory messages={channel ? messages[channel?.id] : []} />
      </Card>
    </div>
  );
}
