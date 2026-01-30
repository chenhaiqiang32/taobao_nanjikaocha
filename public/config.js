/** Global Configs */
window.configs = {
  websocket: "ws://172.23.57.52:9999/gis/gis/websocket/client", //人员定位数据websocket地址
  floorToName: {
    "1楼_室内": {
      "4c": "中心数据机房",
    },
    "2楼_室内": {
      "2-1c": "无线发射机房",
      "1-1c": "UPS机房",
    },
    柴油发电机房_室内: {
      "1c": "柴油发电机房",
    },
  },
};
window.floorToName = {
  aF01: {
    path: "inDoor/A001B001",
    floor: "F01",
  },
  aF02: {
    path: "inDoor/A001B001",
    floor: "F02",
  },
  aF03: {
    path: "inDoor/A001B001",
    floor: "F03",
  },
  bF01: {
    path: "inDoor/A001B002",
    floor: "F01",
  },
  'accl-250t-1': {
    path: "inDoor/accl-250t-1",
    floor: "F01",
  },
  'psy-20t-1': {
    path: "inDoor/psy-20t-1",
    floor: "F01",
  },
  'wccl-3000t-1': {
    path: "inDoor/wccl-3000t-1",
    floor: "F01",
  },
};