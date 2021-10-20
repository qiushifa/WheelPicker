import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";

let countNum = 0; // 识别点击次数

/**
 * 参数说明
 * @param options(必填参数)  数据源,需要显示的数据
 * @param scrollEnd(必填参数) 滚动结束的回调
 * @param containerHeight 容器的高度
 * @param defaultIndex 初始化定位的索引，默认为0
 * @param itemHeight 行高
 * @param contrastColor 选中行的文本颜色
 * @param selectLineLayerHeight 选中行的layer高度，默认 2px
 * @param bgColor: 背景色
 * @param primaryColor 未选中的文本颜色
 * @param modalCanWheel 当鼠标滚动超出后是否可以继续滚动,暂时未实现
 */
interface IProps {
  options: string[];
  scrollEnd: (index: number, value: string) => void;
  containerHeight?: number;
  defaultIndex?: number;
  itemHeight?: number;
  contrastColor?: string; // 选中颜色
  selectLineLayerHeight?: number;
  bgColor?: string;
  primaryColor?: string;
}
const WheelPicker: React.FC<IProps> = forwardRef(
  (
    {
      options,
      defaultIndex = 0,
      itemHeight = 40,
      scrollEnd,
      containerHeight = 200,
      contrastColor = "red",
      selectLineLayerHeight = 2,
      bgColor = "#fff",
      primaryColor = "#000",
    },
    ref
  ) => {
    // 偏移的item个数（距离顶部）
    const selectLineOffsetNum = Math.floor(containerHeight / (2 * itemHeight));
    // 选中行距离顶部的大小
    const selectLineTop = itemHeight * selectLineOffsetNum;
    const fixDefault = () => {
      if (defaultIndex < 0) {
        return 0;
      }
      if (defaultIndex >= options.length) {
        return options.length - 1;
      }
      return defaultIndex;
    };

    defaultIndex = fixDefault();

    const wheelRef = useRef(null);
    const sliderRef = useRef<HTMLUListElement>(null);
    const [startY, setStartY] = useState(0);
    const [oldMoveY, setOldMoveY] = useState(0);
    const [mousedownStatus, setMousedownStatus] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

    //  @description: 3d滚动
    const movePosition = (distance: number) => {
      if (sliderRef.current) {
        sliderRef.current.style.webkitTransform = `translate3d(0,${distance}px, 0)`;
        sliderRef.current.style.transform = `translate3d(0,${distance}px, 0)`;
      }
    };

    // 设置初始默认值
    useEffect(() => {
      const nowDistance = (selectLineOffsetNum - defaultIndex) * itemHeight;
      movePosition(nowDistance);
    }, [defaultIndex, itemHeight, selectLineOffsetNum]);

    // 获得偏移的Y值
    const updateCurDistance = () => {
      let temp = 0;
      if (sliderRef.current) {
        if (sliderRef.current.style.transform) {
          temp = parseInt(sliderRef.current.style.transform.split(",")[1], 10);
        } else {
          temp = parseInt(
            sliderRef.current.style.webkitTransform.split(",")[1],
            10
          );
        }
      }

      return temp;
    };

    const getIndex = (distance: number) =>
      Math.round((selectLineOffsetNum * itemHeight - distance) / itemHeight);

    const fixPosition = (distance: number) =>
      -(getIndex(distance) - selectLineOffsetNum) * itemHeight;

    // 修正坐标index超过或少于总长
    const fixIndex = (idx: number) => {
      if (idx >= options.length) {
        return options.length - 1;
      }
      if (idx < 0) {
        return 0;
      }
      return idx;
    };

    // 触摸事件
    const itemTouch = (event: any) => {
      switch (event.type) {
        case "touchstart":
          setStartY(parseInt(event.touches[0].clientY, 10));
          setOldMoveY(parseInt(event.touches[0].clientY, 10));
          break;

        case "touchend": {
          event.preventDefault();
          const endY = parseInt(event.changedTouches[0].clientY, 10);
          const tmpOffset = endY - startY;
          const oversizeBorder =
            -(options.length - selectLineOffsetNum - 1) * itemHeight;

          if (tmpOffset === 0) {
            const allHeight =
              document.getElementsByTagName("html")[0].clientHeight;
            const tmp = parseInt(`${(allHeight - endY) / itemHeight}`, 10);
            if (tmp !== selectLineOffsetNum) {
              const tmpIndex = tmp - selectLineOffsetNum;
              const newDis = updateCurDistance() + tmpIndex * itemHeight;
              if (
                newDis <= selectLineOffsetNum * itemHeight &&
                newDis >= oversizeBorder
              ) {
                movePosition(newDis);
                const currentIdx = fixIndex(getIndex(newDis));
                scrollEnd(currentIdx, options[currentIdx]);
                setSelectedIndex(currentIdx);
              }
            }
          } else {
            // 修正位置
            const tmpDis = fixPosition(updateCurDistance());
            movePosition(tmpDis);
            if (tmpDis + tmpOffset > selectLineOffsetNum * itemHeight) {
              setTimeout(() => {
                movePosition(selectLineOffsetNum * itemHeight);
              }, 100);
            } else if (tmpDis + tmpOffset < oversizeBorder) {
              movePosition(oversizeBorder);
            }

            const currentIdx = fixIndex(getIndex(updateCurDistance()));
            scrollEnd(currentIdx, options[currentIdx]);
            setSelectedIndex(currentIdx);
          }
          break;
        }

        case "touchmove":
          event.preventDefault();
          movePosition(
            updateCurDistance() + event.touches[0].clientY - oldMoveY
          );
          setOldMoveY(event.touches[0].clientY);
          break;

        default:
          break;
      }
    };
    // 鼠标拖拽事件
    const itemDrag = (event: any) => {
      switch (event.type) {
        case "mousedown":
          countNum += 1;
          setStartY(event.clientY);
          setOldMoveY(event.clientY);
          setMousedownStatus(true);
          break;
        case "mouseup": {
          countNum += 1;
          const tmpOffset = event.clientY - startY;
          const oversizeBorder =
            -(options.length - selectLineOffsetNum - 1) * itemHeight;

          if (tmpOffset === 0) {
            // 这相当于点击事件，并且根据点击次数区分鼠标的mouseup是否在其外部，如果是，再次进入后的点击要加以区分
            if (countNum % 2 !== 0) {
              // 离开时所在的index
              const leaveIndex =
                selectLineOffsetNum - updateCurDistance() / itemHeight;
              const tmpIndex = fixIndex(Math.round(leaveIndex));
              movePosition((selectLineOffsetNum - tmpIndex) * itemHeight);
              scrollEnd(tmpIndex, options[tmpIndex]);
              setSelectedIndex(tmpIndex);
            } else {
              // 获取整个文档高度以计算
              const allHeight =
                document.getElementsByTagName("html")[0].clientHeight;
              const tmp = parseInt(
                `${(allHeight - event.clientY) / itemHeight}`,
                10
              );
              if (tmp !== selectLineOffsetNum) {
                const tmpIndex = tmp - selectLineOffsetNum;
                const newDis = updateCurDistance() + tmpIndex * itemHeight;
                if (
                  newDis <= selectLineOffsetNum * itemHeight &&
                  newDis >= oversizeBorder
                ) {
                  movePosition(newDis);
                  const currentIdx = fixIndex(getIndex(newDis));
                  scrollEnd(currentIdx, options[currentIdx]);
                  setSelectedIndex(currentIdx);
                }
              }
            }
            countNum = 0;
          } else {
            // 修正位置
            const tmpDis = fixPosition(updateCurDistance());
            movePosition(tmpDis);
            // 反弹处理
            if (tmpDis + tmpOffset > selectLineOffsetNum * itemHeight) {
              setTimeout(() => {
                movePosition(selectLineOffsetNum * itemHeight);
              }, 100);
            } else if (tmpDis + tmpOffset < oversizeBorder) {
              setTimeout(() => {
                movePosition(oversizeBorder);
              }, 100);
            }
            const currentIdx = fixIndex(getIndex(tmpDis));
            scrollEnd(currentIdx, options[currentIdx]);
            setSelectedIndex(currentIdx);
          }
          setMousedownStatus(false);
          break;
        }

        case "mousemove":
          event.preventDefault();
          if (mousedownStatus) {
            const tmpOffset = event.clientY - oldMoveY;
            movePosition(updateCurDistance() + tmpOffset);
            setOldMoveY(event.clientY);
          }
          break;

        default:
          break;
      }
    };

    // 监听外部的mouseUp事件
    const specialMouseUp = () => {
      const tmpDis = fixPosition(updateCurDistance());
      const currentIdx = fixIndex(getIndex(tmpDis));
      scrollEnd(currentIdx, options[currentIdx]);
      setSelectedIndex(currentIdx);
      movePosition((selectLineOffsetNum - currentIdx) * itemHeight);
      setMousedownStatus(false);
    };

    useImperativeHandle(ref, () => ({
      externalMove: (e: any) => itemDrag(e),
      externalUp: () => specialMouseUp(),
    }));

    // 渲染列表
    const renderWheels = () => (
      <div
        className="mobileSelect cursor-pointer w-full h-full"
        style={{ backgroundColor: bgColor }}
      >
        {/** gralyLayer 撑满html,识别滚动事件和mouseUp事件，使鼠标在move到容器外后仍可继续滚动页面 */}
        {/* <div
        className="grayLayer top-0 left-0 right-0 bottom-0 block fixed"
        onMouseMove={(e) => {
          console.log("dddd");
          if (modalCanWheel) {
            itemDrag(e);
          }
        }}
        onMouseUp={() => {
          if (modalCanWheel) {
            specialMouseUp();
          }
        }}
      /> */}

        <div className="content">
          <div className="panel relative">
            <div className="fixWidth">
              <div
                className="wheels overflow-hidden"
                style={{ height: `${containerHeight}px` }}
              >
                <div
                  className="wheel relative float-left overflow-hidden w-full"
                  ref={wheelRef}
                  style={{ height: `${containerHeight}px`, zIndex: 999 }}
                >
                  <ul
                    onMouseDown={itemDrag}
                    onMouseMove={itemDrag}
                    onMouseUp={itemDrag}
                    onTouchStart={itemTouch}
                    onTouchEnd={itemTouch}
                    onTouchMove={itemTouch}
                    className="selectContainer text-center w-full"
                    ref={sliderRef}
                    style={{
                      transform: "translate3d(0,0, 0)",
                      WebkitTransform: "translate3d(0,0, 0)",
                    }}
                  >
                    {options.map((item, index) => (
                      <li
                        className="block overflow-hidden whitespace-nowrap  overflow-ellipsis cursor-pointer"
                        key={index}
                        style={{
                          height: `${itemHeight}px`,
                          lineHeight: `${itemHeight}px`,
                          color:
                            index === selectedIndex
                              ? contrastColor
                              : primaryColor,
                        }}
                        onWheel={itemDrag}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div
                className="selectLine w-full absolute pointer-events-none "
                style={{
                  height: `${itemHeight}px`,
                  borderColor: contrastColor,
                  top: `${selectLineTop}px`,
                  borderTopWidth: `${selectLineLayerHeight}px`,
                  borderBottomWidth: `${selectLineLayerHeight}px`,
                }}
              />
              <div
                className="shadowMask absolute top-0 w-full opacity-90 pointer-events-none"
                style={{
                  height: `${containerHeight}px`,
                  background: `linear-gradient(to bottom, ${bgColor}, rgba(255, 255, 255, 0), ${bgColor})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );

    return renderWheels();
  }
);

export default WheelPicker;
