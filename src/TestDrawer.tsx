import React from "react";
import Drawer from "@material-ui/core/Drawer";

interface IProps {
  visible: boolean;
}

const TestDrawer: React.FC<IProps> = ({ visible, children }) => {
  return (
    <Drawer open={visible} anchor={"bottom"}>
      {children}
    </Drawer>
  );
};

export default TestDrawer;
