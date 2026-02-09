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
  HSDH: {
    path: "inDoor/HSDH",
    floor: "F01",
  },
  LJFS: {
    path: "inDoor/LJFS",
    floor: "F01",
  },
  QN: {
    path: "inDoor/QN",
    floor: "F01",
  },
  RY: {
    path: "inDoor/RY",
    floor: "F01",
  },
  WDW: {
    path: "inDoor/WDW",
    floor: "F01",
  },
  WSCL: {
    path: "inDoor/WSCL",
    floor: "F01",
  },
  
};