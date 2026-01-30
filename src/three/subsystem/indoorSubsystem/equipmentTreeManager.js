import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { indoorModelFiles } from "../../../assets/modelList";
import { web3dModelsGroup } from "../../../message/postMessage";

/**
 * 设备树数据管理器
 * 负责按需加载室内模型的设备树数据
 */
export class EquipmentTreeManager {
  constructor() {
    this.equipmentTree = {};
    this.loadedBuildings = new Set();
    this.loadingPromises = new Map();
  }

  /**
   * 获取指定建筑的设备树数据
   * @param {string} buildingName - 建筑名称
   * @returns {Promise<Object>} 设备树数据
   */
  async getEquipmentTree(buildingName) {
    console.log(`🔍 请求获取建筑 ${buildingName} 的设备树数据`);
    // 如果已经加载过，直接返回
    if (this.loadedBuildings.has(buildingName)) {
      console.log(`✅ 建筑 ${buildingName} 的设备树数据已缓存，直接返回`);
      return this.equipmentTree[buildingName] || {};
    }

    // 如果正在加载中，返回加载Promise
    if (this.loadingPromises.has(buildingName)) {
      console.log(
        `⏳ 建筑 ${buildingName} 的设备树数据正在加载中，等待完成...`
      );
      return this.loadingPromises.get(buildingName);
    }

    // 开始加载
    console.log(`🚀 开始加载建筑 ${buildingName} 的设备树数据...`);
    const loadPromise = this.loadBuildingEquipmentTree(buildingName);
    this.loadingPromises.set(buildingName, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedBuildings.add(buildingName);
      this.loadingPromises.delete(buildingName);
      console.log(`✅ 建筑 ${buildingName} 的设备树数据加载完成`);
      return result;
    } catch (error) {
      this.loadingPromises.delete(buildingName);
      console.error(`❌ 建筑 ${buildingName} 的设备树数据加载失败:`, error);
      throw error;
    }
  }

  /**
   * 加载指定建筑的设备树数据（仅提取数据，不处理动画）
   * @param {string} buildingName - 建筑名称
   * @returns {Promise<Object>} 设备树数据
   */
  async loadBuildingEquipmentTree(buildingName) {
    console.log(`开始加载建筑 ${buildingName} 的设备树数据...`);

    // 检查建筑是否在室内模型列表中
    const modelFileName = `${buildingName}.glb`;
    if (!indoorModelFiles.includes(modelFileName)) {
      console.warn(`建筑 ${buildingName} 不在室内模型列表中`);
      return {};
    }

    try {
      // 直接使用 GLTFLoader 加载，不通过 loadGLTF，避免触发动画处理
      const loader = new GLTFLoader();
      
      // 配置 DRACO 加载器（如果需要）
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("./draco/");
      loader.setDRACOLoader(dracoLoader);

      const modelPath = `./models/inDoor/${modelFileName}`;
      const gltf = await loader.loadAsync(modelPath);

      // 查找 name 为 "equip" 的子对象
      const equipChild = gltf.scene.children.find(
        (child) => child.name === "equip"
      );

      if (equipChild && equipChild.children) {
        this.equipmentTree[buildingName] = equipChild.children.map((child) => {
          // 按 '_' 分割 name，第0项为id，最后一项为name
          const nameParts = child.name.split("_");
          return {
            id: nameParts[0], // 第0项为id
            name: nameParts[nameParts.length - 1], // 最后一项为name
          };
        });
      } else {
        this.equipmentTree[buildingName] = [];
      }

      console.log(
        `建筑 ${buildingName} 设备树数据加载完成:`,
        this.equipmentTree[buildingName]
      );

      // 清理加载的模型（只提取数据，不需要保留模型）
      gltf.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      // 推送给前端
      const buildingTree = {};
      buildingTree[buildingName] = this.equipmentTree[buildingName] || [];
      web3dModelsGroup(buildingTree);

      return this.equipmentTree[buildingName] || {};
    } catch (error) {
      console.error(`加载建筑 ${buildingName} 设备树数据失败:`, error);
      throw error;
    }
  }

  /**
   * 预加载所有建筑的设备树数据（可选，用于性能优化）
   * @returns {Promise<void>}
   */
  async preloadAllEquipmentTrees() {
    console.log("开始预加载所有建筑的设备树数据...");

    const loadPromises = indoorModelFiles.map((fileName) => {
      const buildingName = fileName.replace(".glb", "");
      return this.getEquipmentTree(buildingName);
    });

    try {
      await Promise.all(loadPromises);
      console.log("✅ 所有建筑设备树数据预加载完成");
    } catch (error) {
      console.error("预加载设备树数据失败:", error);
    }
  }

  /**
   * 清除指定建筑的设备树数据
   * @param {string} buildingName - 建筑名称
   */
  clearBuildingEquipmentTree(buildingName) {
    if (this.equipmentTree[buildingName]) {
      delete this.equipmentTree[buildingName];
      this.loadedBuildings.delete(buildingName);
      console.log(`已清除建筑 ${buildingName} 的设备树数据`);
    }
  }

  /**
   * 清除所有设备树数据
   */
  clearAllEquipmentTrees() {
    this.equipmentTree = {};
    this.loadedBuildings.clear();
    this.loadingPromises.clear();
    console.log("已清除所有设备树数据");
  }

  /**
   * 获取已加载的建筑列表
   * @returns {Array<string>} 已加载的建筑名称列表
   */
  getLoadedBuildings() {
    return Array.from(this.loadedBuildings);
  }

  /**
   * 检查建筑是否已加载
   * @param {string} buildingName - 建筑名称
   * @returns {boolean} 是否已加载
   */
  isBuildingLoaded(buildingName) {
    return this.loadedBuildings.has(buildingName);
  }
}

// 创建全局单例实例
export const equipmentTreeManager = new EquipmentTreeManager();
