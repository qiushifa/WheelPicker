# 利用tsx编写的纯粹的滚动选择器（支持滚动选择和点击选择）

## 演示请看App.tsx代码

使用了tailwindcss，演示代码使用了materialUI

## 注意

1，默认情况下，WheelPicker是不支持外部滚动的（即鼠标移出wheelpicker后就会不在响应滚动）

2，如果想要支持外部滚动（比如鼠标移动到modal视图时，仍想响应滚动），这时需要三步：

1）给WheelPicker添加ref

2）在WheelPicker的父级添加一个div，style样式参考例子（需要positon为fixed）

3）添加的div的滚动事件，执行上面ref组件的externalMove事件；鼠标松开时执行exterUp事件即可





