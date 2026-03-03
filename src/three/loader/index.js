import * as THREE from "three";
import { LoadingManager } from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFLoader } from "../../lib/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GbkOBJLoader } from "../../lib/GbkOBJLoader";
import { loadingInstance } from "./loading";
import { postOnLoaded, postOnLoading } from "../../message/postMessage";
import { MeshoptDecoder } from "meshoptimizer";

const loadingManager = new LoadingManager(
  function onLoaded() {
    loadingInstance.close();
    postOnLoaded();
  },
  function onProgress(url, loaded, total) {
    loadingInstance.service(((100 * loaded) / total).toFixed(2));
  },
  function onError(url) {
    console.error("Error loading:", url);
    loadingInstance.close(); // 确保在出错时关闭 loading 界面
  }
);

export const loader = new GLTFLoader(loadingManager);

// 配置 DRACOLoader 以支持 Draco 压缩
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
loader.setDRACOLoader(dracoLoader);

// 配置 MeshoptDecoder 以支持 meshopt 压缩
async function setupMeshoptDecoder() {
  try {
    console.log("🔄 正在初始化 MeshoptDecoder...");
    // 等待 MeshoptDecoder 初始化完成
    await MeshoptDecoder.ready;
    loader.setMeshoptDecoder(MeshoptDecoder);
    console.log("✅ MeshoptDecoder 已成功配置");
  } catch (error) {
    console.warn("⚠️ MeshoptDecoder 配置失败:", error);
  }
}

// 立即设置 MeshoptDecoder
setupMeshoptDecoder();

// 全局动画管理器
class GlobalAnimationManager {
  constructor() {
    // 按动画名称存储动画信息：{ mixer, action, isPlaying }
    this.animations = new Map();
    this.materialFlows = new Map(); // 存储材质流动动画
    this.clock = new THREE.Clock();
    this.isPlaying = false;
  }

  /**
   * 添加动画到管理器（不自动播放）
   * @param {string} animationName - 动画名称
   * @param {THREE.AnimationMixer} mixer - 动画混合器
   * @param {THREE.AnimationAction} action - 动画动作
   */
  addAnimation(animationName, mixer, action) {
    // 如果动画名称已存在，使用唯一名称
    let uniqueName = animationName;
    let counter = 1;
    while (this.animations.has(uniqueName)) {
      uniqueName = `${animationName}_${counter}`;
      counter++;
    }

    this.animations.set(uniqueName, {
      mixer: mixer,
      action: action,
      isPlaying: false,
    });
    this.clock.start();
    
    return uniqueName; // 返回实际使用的名称（可能被修改为唯一名称）
  }

  /**
   * 播放指定名称的动画（如果已暂停则恢复播放）
   * @param {string} animationName - 动画名称
   */
  playAnimation(animationName) {
    const animation = this.animations.get(animationName);
    if (animation) {
      // 确保 action 已启用
      animation.action.enabled = true;
      animation.action.weight = 1.0; // 设置权重为1，确保动画完全生效
      animation.action.timeScale = 1.0; // 确保时间缩放为正常速度
      animation.action.paused = false; // 确保未暂停
      animation.action.play(); // 播放动画
      
      // 确保 mixer 的 root 对象存在且有效
      if (animation.mixer && animation.mixer._root) {
        // 检查 root 对象是否在场景中
        if (!animation.mixer._root.parent && animation.mixer._root.parent !== null) {
          console.warn(`⚠️ 动画 "${animationName}" 的 root 对象不在场景中`);
        }
      }
      
      animation.isPlaying = true;
      this.isPlaying = true; // 确保全局更新循环运行
      
      console.log(`🎬 动画 "${animationName}" 播放中:`, {
        enabled: animation.action.enabled,
        paused: animation.action.paused,
        timeScale: animation.action.timeScale,
        weight: animation.action.weight,
        effectiveWeight: animation.action.getEffectiveWeight(),
        effectiveTimeScale: animation.action.getEffectiveTimeScale(),
        mixerRoot: animation.mixer._root ? animation.mixer._root.name : 'unknown'
      });
    } else {
      console.warn(`⚠️ 动画 "${animationName}" 不存在`);
      console.log(`可用的动画名称:`, Array.from(this.animations.keys()));
    }
  }

  /**
   * 暂停指定名称的动画
   * @param {string} animationName - 动画名称
   */
  pauseAnimation(animationName) {
    const animation = this.animations.get(animationName);
    if (animation) {
      animation.action.paused = true;
      animation.isPlaying = false;
    } else {
      console.warn(`⚠️ 动画 "${animationName}" 不存在`);
    }
  }

  /**
   * 停止指定名称的动画（重置到开始）
   * @param {string} animationName - 动画名称
   */
  stopAnimation(animationName) {
    const animation = this.animations.get(animationName);
    if (animation) {
      animation.action.stop();
      animation.isPlaying = false;
    } else {
      console.warn(`⚠️ 动画 "${animationName}" 不存在`);
    }
  }

  /**
   * 获取动画是否正在播放
   * @param {string} animationName - 动画名称
   * @returns {boolean}
   */
  isAnimationPlaying(animationName) {
    const animation = this.animations.get(animationName);
    return animation ? animation.isPlaying : false;
  }

  /**
   * 获取所有动画名称列表
   * @returns {string[]}
   */
  getAnimationNames() {
    return Array.from(this.animations.keys());
  }

  addMaterialFlow(material, speedX) {
    // 为材质添加流动动画
    this.materialFlows.set(material, {
      speedX: speedX,
      originalOffset: material.userData.originalOffset,
    });
  }

  update() {
    if (!this.isPlaying) {
      return; // 如果没有动画在播放，跳过更新
    }

    const delta = this.clock.getDelta();
    if (delta === 0 || isNaN(delta) || !isFinite(delta)) {
      return; // 避免 delta 为 0 或无效值的情况
    }

    // 收集需要更新的mixer（避免同一个mixer被更新多次）
    const mixersToUpdate = new Set();
    let hasActiveAnimations = false;
    
    this.animations.forEach((animationData, animationName) => {
      // 检查动画是否应该更新
      if (animationData.isPlaying && !animationData.action.paused && animationData.action.enabled) {
        // 验证 action 是否真的在运行
        const effectiveWeight = animationData.action.getEffectiveWeight();
        const effectiveTimeScale = animationData.action.getEffectiveTimeScale();
        
        if (effectiveWeight > 0 && effectiveTimeScale !== 0) {
          mixersToUpdate.add(animationData.mixer);
          hasActiveAnimations = true;
        } else {
          console.warn(`动画 "${animationName}" 权重或时间缩放为0:`, {
            effectiveWeight,
            effectiveTimeScale
          });
        }
      }
    });

    // 更新所有需要更新的mixer
    if (hasActiveAnimations && mixersToUpdate.size > 0) {
      mixersToUpdate.forEach((mixer) => {
        try {
          const beforeTime = mixer.time;
          mixer.update(delta);
          const afterTime = mixer.time;
          
          // 只在第一次更新时输出日志，避免日志过多
          if (!mixer._updateLogged) {
            console.log(`🔄 Mixer 更新: delta=${delta.toFixed(4)}, time=${beforeTime.toFixed(4)} -> ${afterTime.toFixed(4)}`);
            mixer._updateLogged = true;
            // 5秒后重置日志标志，以便再次输出
            setTimeout(() => {
              mixer._updateLogged = false;
            }, 5000);
          }
        } catch (error) {
          console.error("更新 mixer 时出错:", error);
        }
      });
    } else if (this.animations.size > 0) {
      // 如果有动画但没有活跃的，输出调试信息
      if (!this._noActiveAnimationsLogged) {
        console.warn("⚠️ 有动画但没有任何活跃的动画需要更新");
        this.animations.forEach((animationData, animationName) => {
          console.log(`动画 "${animationName}":`, {
            isPlaying: animationData.isPlaying,
            paused: animationData.action.paused,
            enabled: animationData.action.enabled,
            effectiveWeight: animationData.action.getEffectiveWeight(),
            effectiveTimeScale: animationData.action.getEffectiveTimeScale()
          });
        });
        this._noActiveAnimationsLogged = true;
        setTimeout(() => {
          this._noActiveAnimationsLogged = false;
        }, 5000);
      }
    }

    // 更新材质流动动画（如果需要全局控制，可以添加条件）
    this.materialFlows.forEach((flowData, material) => {
      if (material.map && material.map.offset) {
        // 使用基于时间的速度，确保在不同帧率下效果一致
        const timeDelta = delta;
        // 更新纹理偏移，实现流动效果
        material.map.offset.x += flowData.speedX * timeDelta * 60; // 乘以60以补偿delta时间

        // 可选：当偏移值过大时重置，避免数值过大
        // if (material.map.offset.x > 1) {
        //   material.map.offset.x -= 0.1;
        // } else if (material.map.offset.x < -1) {
        //   material.map.offset.x += 0.1;
        // }
        
        // 确保材质更新
        material.map.needsUpdate = true;
      }
    });
  }

  play() {
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
  }

  // 移除材质流动动画
  removeMaterialFlow(material) {
    this.materialFlows.delete(material);
  }

  // 清理所有材质流动动画
  clearMaterialFlows() {
    this.materialFlows.clear();
  }
}

// 创建全局动画管理器实例
export const globalAnimationManager = new GlobalAnimationManager();

// 处理模型动画的通用函数
function handleModelAnimations(gltf, model) {
  if (gltf.animations && gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(model);

    // 将所有动画添加到mixer，但不自动播放，按名称存储到管理器
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat);
      action.clampWhenFinished = true;
      // 不自动播放，只存储到管理器

      // 使用动画clip的名称，如果没有名称则使用默认名称
      const animationName = clip.name || `animation_${model.name || "unnamed"}_${gltf.animations.indexOf(clip)}`;
      const actualName = globalAnimationManager.addAnimation(animationName, mixer, action);
      
      console.log(`✅ 动画 "${actualName}", "${animationName}", 已添加到管理器（未自动播放）`);
    });
    // 启动全局动画更新循环（但不播放任何动画）
    globalAnimationManager.play();
    
    console.log(
      `✅ 模型 ${model.name || "unnamed"} 的 ${
        gltf.animations.length
      } 个动画已添加到管理器，已测试播放`
    );
  }

  // 处理材质流动动画
  handleMaterialFlowAnimation(model);
}

// 处理材质流动动画
function handleMaterialFlowAnimation(model) {
  const speedX = -0.0048; // 流动速度，可以根据需要调整

  model.traverse((child) => {
    if (child.isMesh && child.name && child.name.includes("move")) {
      // 检查材质
      if (child.material) {
        if (Array.isArray(child.material)) {
          // 处理材质数组
          child.material.forEach((material) => {
            if (material.map) {
              // 确保材质有map属性
              if (!material.userData.originalOffset) {
                material.userData.originalOffset = {
                  x: material.map.offset.x,
                  y: material.map.offset.y,
                };
              }
              // 添加到全局动画管理器的材质流动列表
              globalAnimationManager.addMaterialFlow(material, speedX);
            }
          });
        } else {
          // 处理单个材质
          if (child.material.map) {
            // 确保材质有map属性
            if (!child.material.userData.originalOffset) {
              child.material.userData.originalOffset = {
                x: child.material.map.offset.x,
                y: child.material.map.offset.y,
              };
            }
            // 添加到全局动画管理器的材质流动列表
            globalAnimationManager.addMaterialFlow(child.material, speedX);
          }
        }

        console.log(`✅ 为包含"move"的mesh "${child.name}" 添加材质流动动画`);
      }
    }
  });
}

/**
 * @param {{name:string,path:string,type:string}[]} models 模型路径或者数组
 * @param {(gltf:import("three/examples/jsm/loaders/GLTFLoader").GLTF,path:string)=>{}} onProgress 模型加载回调
 * @param {()=>void} onLoaded
 * @returns {Promise}
 */
export async function loadGLTF(models, onProgress, onLoaded) {
  // 确保 MeshoptDecoder 已初始化
  try {
    await MeshoptDecoder.ready;
  } catch (error) {
    console.warn("⚠️ MeshoptDecoder 初始化失败，但继续加载模型:", error);
  }

  const promises = [];
  loadingInstance.service(0);
  postOnLoading();
  if (Array.isArray(models)) {
    models.forEach((model) => {
      if (model.type !== ".glb" && model.type !== ".gltf") return;
      const promise = loader.loadAsync(model.path).then((gltf) => {
        // 统一处理动画
        handleModelAnimations(gltf, gltf.scene);
        onProgress(gltf, model.name);
      });
      promises.push(promise);
    });
  } else {
    if (models.type !== ".glb" && models.type !== ".gltf") return;
    const promise = loader.loadAsync(models.path).then((gltf) => {
      // 统一处理动画
      handleModelAnimations(gltf, gltf.scene);
      onProgress(gltf, models.name);
    });
    promises.push(promise);
  }

  return Promise.all(promises).then(() => {
    onLoaded && onLoaded();
  });
}

/**
 * @param {{name:string,path:string,type:string}[]} models 模型路径或者数组
 * @param {{name: string;vertices: Vector3[];}[]} onProgress 模型加载回调
 * @returns {Promise}
 */
export function loadOBJ(models, onProgress) {
  const loader = new GbkOBJLoader();
  const promises = [];

  models.forEach((model) => {
    if (model.type !== ".obj") return;
    /**@type {Promise<{name: string;vertices: Vector3[];}[]} */
    const promise = loader
      .loadAsync(model.path)
      .then((object) => onProgress(object, model.name));
    promises.push(promise);
  });
  return Promise.all(promises);
}
