1、加载 qiehuan.glb 模型：
2、从 ./models/qiehuan.glb 加载模型
3、模型加载后设置为不可见（visible = false）
4、射线检测对象：加载 qiehuan.glb 模型后的.children 名称和 floor 相同名称下的所有名称包含 \_qiehuan 的对象，只对这些对象进行射线检测，同时给所有对象包围盒上显示一个设备牌子 css2d 默认隐藏
5、鼠标交互效果：
鼠标移入：，给包围盒 outline
鼠标移开或者射线没有检测到设备：移除 outline
鼠标点击到设备：CSS2D 牌子显示，视角拉进到模型

牌子内容：
显示模型名称（\_qiehuan 前面的部分）
使用黑色半透明背景，青色边框的样式
右键双击退出：
移除所有 outline
清除事件监听
移除所有牌子
执行楼栋级别的恢复功能
