import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// 获取今天的日期
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// 获取一周的日期范围
function getWeekDates() {
  const dates = [];
  const startDate = new Date(today);
  // 从今天开始的一周
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    dates.push({
      date: dateStr,
      weekDay: weekDay,
      isToday: i === 0
    });
  }
  return dates;
}

// 创建工作表数据
function createWorkPlanData() {
  const weekDates = getWeekDates();
  
  // 工作表1: 今日工作内容
  const todayWork = [
    ['工作计划表'],
    [],
    ['日期', todayStr],
    [],
    ['今日工作内容'],
    ['序号', '任务名称', '状态', '备注'],
    ['1', '根据数据控制子场景的设备的颜色和动画的运行', '进行中', ''],
    ['2', '工作台整体效果调试', '待开始', ''],
    ['3', '工作台界面和楼层界面的切换逻辑', '待开始', ''],
    ['4', '根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '待开始', ''],
  ];

  // 工作表2: 一周计划安排
  const weekPlan = [
    ['一周工作计划安排'],
    [],
    ['日期', '星期', '计划任务', '状态', '备注'],
  ];

  // 为每一天添加计划
  weekDates.forEach((day, index) => {
    let tasks = [];
    if (day.isToday) {
      // 今天：所有任务都进行中或待开始
      tasks = [
        ['根据数据控制子场景的设备的颜色和动画的运行', '进行中', ''],
        ['工作台整体效果调试', '待开始', ''],
        ['工作台界面和楼层界面的切换逻辑', '待开始', ''],
        ['根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '待开始', ''],
      ];
    } else if (index === 1) {
      // 明天：继续今天的工作
      tasks = [
        ['根据数据控制子场景的设备的颜色和动画的运行', '进行中', '预计完成'],
        ['工作台整体效果调试', '进行中', '开始调试'],
        ['工作台界面和楼层界面的切换逻辑', '待开始', ''],
      ];
    } else if (index === 2) {
      // 第三天：完成第一个任务，继续其他任务
      tasks = [
        ['根据数据控制子场景的设备的颜色和动画的运行', '已完成', ''],
        ['工作台整体效果调试', '进行中', ''],
        ['工作台界面和楼层界面的切换逻辑', '进行中', '开始开发'],
      ];
    } else if (index === 3) {
      // 第四天：继续调试和开发
      tasks = [
        ['工作台整体效果调试', '进行中', ''],
        ['工作台界面和楼层界面的切换逻辑', '进行中', ''],
        ['根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '待开始', ''],
      ];
    } else if (index === 4) {
      // 第五天：完成调试，继续开发
      tasks = [
        ['工作台整体效果调试', '已完成', ''],
        ['工作台界面和楼层界面的切换逻辑', '进行中', ''],
        ['根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '进行中', '开始开发'],
      ];
    } else if (index === 5) {
      // 第六天：完成切换逻辑，继续弹窗开发
      tasks = [
        ['工作台界面和楼层界面的切换逻辑', '已完成', ''],
        ['根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '进行中', ''],
      ];
    } else {
      // 第七天：完成所有任务
      tasks = [
        ['根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '已完成', ''],
        ['整体测试和优化', '进行中', ''],
      ];
    }

    tasks.forEach((task, taskIndex) => {
      weekPlan.push([
        taskIndex === 0 ? day.date : '',
        taskIndex === 0 ? day.weekDay : '',
        task[0],
        task[1],
        task[2]
      ]);
    });
    
    // 如果不是最后一天，添加空行分隔
    if (index < weekDates.length - 1) {
      weekPlan.push([]);
    }
  });

  // 工作表3: 功能任务详情
  const taskDetails = [
    ['功能任务详情'],
    [],
    ['任务编号', '任务名称', '任务描述', '优先级', '预计工时', '负责人', '状态'],
    ['T001', '根据数据控制子场景的设备的颜色和动画的运行', '实现根据传入的数据动态控制子场景中设备的颜色变化和动画播放状态', '高', '2天', '', '进行中'],
    ['T002', '工作台整体效果调试', '调试工作台的整体视觉效果，包括光照、材质、渲染效果等', '高', '1.5天', '', '待开始'],
    ['T003', '工作台界面和楼层界面的切换逻辑', '实现工作台界面和楼层界面之间的平滑切换，包括场景切换、相机动画等', '中', '2天', '', '待开始'],
    ['T004', '根据传入数据，点击工作台设备显示动态的数据的css2d弹窗', '实现点击工作台设备时，根据传入的数据动态生成和显示CSS2D弹窗，展示设备相关信息', '中', '1.5天', '', '待开始'],
  ];

  return {
    todayWork,
    weekPlan,
    taskDetails
  };
}

// 生成Excel文件
function generateExcel() {
  const data = createWorkPlanData();
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 创建工作表1: 今日工作内容
  const todaySheet = XLSX.utils.aoa_to_sheet(data.todayWork);
  // 设置列宽
  todaySheet['!cols'] = [
    { wch: 8 },  // 序号
    { wch: 50 }, // 任务名称
    { wch: 12 }, // 状态
    { wch: 30 }, // 备注
  ];
  XLSX.utils.book_append_sheet(workbook, todaySheet, '今日工作内容');

  // 创建工作表2: 一周计划安排
  const weekSheet = XLSX.utils.aoa_to_sheet(data.weekPlan);
  // 设置列宽
  weekSheet['!cols'] = [
    { wch: 12 }, // 日期
    { wch: 8 },  // 星期
    { wch: 50 }, // 计划任务
    { wch: 12 }, // 状态
    { wch: 30 }, // 备注
  ];
  XLSX.utils.book_append_sheet(workbook, weekSheet, '一周计划安排');

  // 创建工作表3: 功能任务详情
  const taskSheet = XLSX.utils.aoa_to_sheet(data.taskDetails);
  // 设置列宽
  taskSheet['!cols'] = [
    { wch: 10 }, // 任务编号
    { wch: 50 }, // 任务名称
    { wch: 60 }, // 任务描述
    { wch: 10 }, // 优先级
    { wch: 12 }, // 预计工时
    { wch: 12 }, // 负责人
    { wch: 12 }, // 状态
  ];
  XLSX.utils.book_append_sheet(workbook, taskSheet, '功能任务详情');

  // 写入文件
  const fileName = `工作计划表_${todayStr}.xlsx`;
  const filePath = path.join(process.cwd(), fileName);
  XLSX.writeFile(workbook, filePath);

  console.log(`工作计划表已生成: ${filePath}`);
  return filePath;
}

// 执行生成
generateExcel();

