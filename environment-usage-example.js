/**
 * RoomEnvironment 使用示例
 *
 * 这个文件展示了如何在项目中使用环境效果功能
 */

// 1. 基本使用 - 地面系统
function basicGroundUsage() {
  // 地面系统会自动设置 RoomEnvironment
  const ground = new Ground(core);

  // 或者手动设置环境类型
  ground.setEnvironment("room"); // RoomEnvironment
  ground.setEnvironment("hdr"); // HDR 环境
  ground.setEnvironment("default"); // 默认环境
}

// 2. 基本使用 - 室内系统
function basicIndoorUsage() {
  // 室内系统默认使用 HDR 环境
  const indoorSubsystem = new IndoorSubsystem(core);

  // 手动切换环境类型
  indoorSubsystem.setIndoorEnvironment("room"); // RoomEnvironment
  indoorSubsystem.setIndoorEnvironment("hdr"); // HDR 环境
  indoorSubsystem.setIndoorEnvironment("default"); // 默认环境
}

// 3. 动态环境切换
function dynamicEnvironmentSwitching() {
  const ground = new Ground(core);

  // 根据时间切换环境
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 18) {
    // 白天使用 HDR 环境
    ground.setEnvironment("hdr");
  } else {
    // 夜晚使用 RoomEnvironment
    ground.setEnvironment("room");
  }
}

// 4. 材质环境贴图设置
function materialEnvironmentSetup() {
  // 创建材质
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2,
  });

  // 手动设置环境贴图
  if (scene.environment) {
    material.envMap = scene.environment;
    material.envMapIntensity = 0.8;
    material.needsUpdate = true;
  }
}

// 5. 批量更新材质环境
function batchUpdateMaterials() {
  // 更新场景中所有材质的环境贴图
  scene.traverse((object) => {
    if (object.isMesh && object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          setupMaterialEnvironment(material);
        });
      } else {
        setupMaterialEnvironment(object.material);
      }
    }
  });
}

// 6. 环境资源管理
function environmentResourceManagement() {
  const ground = new Ground(core);

  // 清理环境资源
  ground.clearEnvironment();

  // 系统销毁时会自动清理
  ground.destroy();
}

// 7. 性能优化示例
function performanceOptimization() {
  const ground = new Ground(core);

  // 使用较低强度的环境贴图以提高性能
  scene.traverse((object) => {
    if (object.isMesh && object.material) {
      if (object.material.envMap) {
        object.material.envMapIntensity = 0.5; // 降低强度
        object.material.needsUpdate = true;
      }
    }
  });
}

// 8. 错误处理示例
function errorHandling() {
  try {
    const ground = new Ground(core);
    ground.setEnvironment("room");
  } catch (error) {
    console.error("环境设置失败:", error);
    // 回退到默认环境
    ground.setEnvironment("default");
  }
}

// 9. 自定义环境配置
function customEnvironmentConfig() {
  const ground = new Ground(core);

  // 设置 RoomEnvironment 并自定义材质环境贴图强度
  ground.setEnvironment("room");

  // 为特定材质设置不同的环境贴图强度
  scene.traverse((object) => {
    if (object.isMesh && object.material) {
      if (object.material.name === "metal") {
        object.material.envMapIntensity = 1.2; // 金属材质使用更高强度
      } else if (object.material.name === "plastic") {
        object.material.envMapIntensity = 0.3; // 塑料材质使用更低强度
      }
      object.material.needsUpdate = true;
    }
  });
}

// 10. 环境切换动画
function environmentTransitionAnimation() {
  const ground = new Ground(core);

  // 使用 TWEEN 创建环境切换动画
  const startIntensity = 0;
  const endIntensity = 0.8;

  new TWEEN.Tween({ intensity: startIntensity })
    .to({ intensity: endIntensity }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((coords) => {
      // 更新所有材质的环境贴图强度
      scene.traverse((object) => {
        if (object.isMesh && object.material) {
          if (object.material.envMap) {
            object.material.envMapIntensity = coords.intensity;
            object.material.needsUpdate = true;
          }
        }
      });
    })
    .start();
}

// 辅助函数
function setupMaterialEnvironment(material) {
  if (
    material &&
    (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial)
  ) {
    if (scene.environment) {
      material.envMap = scene.environment;
      material.envMapIntensity = 0.8;
      material.needsUpdate = true;
    }
  }
}

// 导出示例函数
export {
  basicGroundUsage,
  basicIndoorUsage,
  dynamicEnvironmentSwitching,
  materialEnvironmentSetup,
  batchUpdateMaterials,
  environmentResourceManagement,
  performanceOptimization,
  errorHandling,
  customEnvironmentConfig,
  environmentTransitionAnimation,
};
