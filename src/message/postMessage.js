export const postOnLoading = () => {
  window.parent.postMessage(
    {
      // 三维开始加载模型
      cmd: "onLoading",
    },
    "*"
  );
};
export const postOnLoaded = () => {
  window.parent.postMessage(
    {
      // 三维结束模型加载
      cmd: "onLoaded",
    },
    "*"
  );
};
export const getInspectionId = (data) => {
  // 向前端发送请求获取人员
  window.parent.postMessage({ cmd: "inspectionId", param: data }, "*");
};
export const postPersonBoard = (id) => {
  window.parent.postMessage(
    {
      // 调用前端弹窗
      cmd: "personDetail",
      param: id,
    },
    "*"
  );
};
export const closeDialog = () => {
  window.parent.postMessage(
    {
      // 调用前端弹窗
      cmd: "closeDomDialog",
    },
    "*"
  );
};
export const postGatherList = (data) => {
  window.parent.postMessage(
    {
      // 调用前端弹窗
      cmd: "gatherCallBack",
      param: data,
    },
    "*"
  );
};
export const getPerson = (data) => {
  // 向前端发送请求获取人员
  window.parent.postMessage(
    {
      cmd: "get",
      param: data,
    },
    "*"
  );
};
export const changeIndoor = (data) => {
  // 向前端发送请求获取人员
  window.parent.postMessage(
    {
      cmd: "web3dChangeIndoor",
      param: data,
    },
    "*"
  );
};
export const getBuildingDetail = (id) => {
  window.parent.postMessage(
    {
      cmd: "buildingDetail",
      param: { id },
    },
    "*"
  );
};
export const dblclickBuilding = (data) => {
  // 向前端发送请求获取人员
  window.parent.postMessage(
    {
      cmd: "dbClickBuilding",
      param: data,
    },
    "*"
  );
};
export const getCameraVideo = (data) => {
  // 向前端发送请求获取人员
  window.parent.postMessage({ cmd: "cameraVideoId", param: data }, "*");
};
export const postBuildingId = (data) => {
  // 向前端发送点击的楼栋信息，前端查取楼栋人员
  window.parent.postMessage({ cmd: "switchByBuildingId", param: data }, "*");
};

export const gatherClick = (data) => {
  window.parent.postMessage(
    {
      // 点击聚集牌子
      cmd: "clickUnion",
      param: data, // 人员id
    },
    "*"
  );
};
export const web3dModelsGroup = (data) => {
  window.parent.postMessage(
    {
      cmd: "web3dModelsGroup",
      param: data,
    },
    "*"
  );
};

export const web3dSelectCode = (id) => {
  console.log("web3dSelectCode", id);
  window.parent.postMessage(
    {
      cmd: "web3dSelectCode",
      param: id, // 设备编号
    },
    "*"
  );
};

export const web3dLabelClick = (labelCode) => {
  // 通知前端点击的牌子编号
  window.parent.postMessage(
    {
      cmd: "web3dDesignLabelClick",
      param: labelCode, // 牌子编号
    },
    "*"
  );
};
