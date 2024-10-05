import { Card, Flex, Space } from "antd";
import styles from "./styles.module.scss";
import { useState } from "react";
import "draft-js/dist/Draft.css";
import { Editor, EditorState, RichUtils, DraftHandleValue } from "draft-js";
import { TEXT_STYLES, useTextEditor } from "../../hooks/text-editor";
import {
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { LinkStyling } from "./Styling/link";

export default function TextEditor() {
  const {
    editorState,
    setEditorState,
    handleKeyCommand,
    toggleStyle,
    createLink,
  } = useTextEditor();

  return (
    <Card
      className={styles["editor"]}
      classNames={{ body: styles["editor-body"] }}
    >
      <Space direction="vertical" className="width-full">
        <div className={styles["editable-section"]}>
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            placeholder="Write a message..."
            handleKeyCommand={handleKeyCommand}
          />
        </div>
        <Flex justify="space-between">
          <Space className={styles["styling"]}>
            <button onClick={() => toggleStyle(TEXT_STYLES.BOLD)}>
              <BoldOutlined />
            </button>
            <button onClick={() => toggleStyle(TEXT_STYLES.ITALIC)}>
              <ItalicOutlined />
            </button>
            <LinkStyling createLink={createLink} />
          </Space>
          <button>
            <SendOutlined />
          </button>
        </Flex>
      </Space>
    </Card>
  );
}
