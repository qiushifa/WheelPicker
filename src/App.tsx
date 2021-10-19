import React, { useState } from "react";
import "./App.css";
import TestDrawer from "./TestDrawer";
import WheelPicker from "./WheelPicker";

function App() {
  const [clickState, setClickState] = useState(false);
  // @ts-ignore
  const dataArr = [...Array(15).keys()].map((item) => String(item));
  console.log("dataArr", dataArr);
  return (
    <div className="">
      <button
          onClick={() => {
            setClickState(true);
          }}
        >
          弹出
        </button>
        <TestDrawer visible={clickState}>
          <WheelPicker
            options={dataArr}
            scrollEnd={(index, value) => {
              console.log("@@", index, value);
            }}
          />
        </TestDrawer>
    </div>
  );
}

export default App;
