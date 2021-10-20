import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import TestDrawer from "./TestDrawer";
import WheelPicker from "./WheelPicker";

function App() {
  const [clickState, setClickState] = useState(false);
  // @ts-ignore
  const dataArr = [...Array(15).keys()].map((item) => String(item));
  const modal = useRef(null);
  const modal1 = useRef(null);

  // useEffect(() => {
  //   document.querySelector(".MuiBackdrop-root")?.addEventListener("mousemove", (e) => {
  //     console.log("dd");
  //     //@ts-ignore
  //     modal.current.externalMove(e);
  //     //@ts-ignore
  //     modal1.current.externalMove(e);
  //   });

  //   document.querySelector(".MuiBackdrop-root")?.addEventListener("mouseup", (e) => {
  //     //@ts-ignore
  //     modal.current.externalUp();
  //     //@ts-ignore
  //     modal1.current.externalUp();
  //   });
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[document.querySelector(".MuiBackdrop-root")]);

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
        <div className="grid grid-cols-2 gap-x-2">
          {/* <div
            className="grayLayer top-0 left-0 right-0 bottom-0 block fixed"
            onMouseMove={(e) => {
              //@ts-ignore
              modal.current.externalMove(e);
              //@ts-ignore
              modal1.current.externalMove(e);
            }}
            onMouseUp={() => {
              //@ts-ignore
              modal.current.externalUp();
              //@ts-ignore
              modal1.current.externalUp();
            }}
          /> */}

          <WheelPicker
            options={dataArr}
            scrollEnd={(index, value) => {
              console.log("@@", index, value);
            }}
            //@ts-ignore
            // ref={modal}
          />
          <WheelPicker
            options={dataArr}
            scrollEnd={(index, value) => {
              console.log("@@", index, value);
            }}
            // @ts-ignore
            // ref={modal1}
          />
        </div>
      </TestDrawer>
    </div>
  );
}

export default App;
