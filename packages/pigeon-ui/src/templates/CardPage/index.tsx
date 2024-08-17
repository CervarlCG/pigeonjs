import { Card, Flex } from "antd";
import { PropsWithChildren } from "react";
import styles from "./styles.module.scss";

export default function CardPage(props: PropsWithChildren) {
  return (
    <Flex justify="center" align="center" className={styles["page"]}>
      <Card
        bordered={false}
        className="shadow-normal size-sm"
        style={{ zIndex: 2 }}
      >
        {props.children}
      </Card>
    </Flex>
  );
}
