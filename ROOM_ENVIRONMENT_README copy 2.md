# RoomEnvironment 环境效果设置

## 概述

本项目已集成 Three.js 的 `RoomEnvironment` 功能，用于为 3D 场景提供更真实的环境光照和反射效果。

## 功能特性

### 1. 自动环境设置

- 在 `Ground` 系统初始化时自动设置 `RoomEnvironment`
- 为所有材质自动应用环境贴图
- 支持动态切换不同的环境效果

### 2. 环境类型支持

- **RoomEnvironment**: 基于物理的室内环境光照
- **HDR 环境**: 高动态范围环境贴图
- **默认环境**: 简单的天空颜色背景

### 3. 材质优化

- 自动调整材质的 `roughness` 和 `metalness` 属性
- 为所有 `MeshStandardMaterial` 和 `MeshPhysicalMaterial` 设置环境贴图
- 支持环境贴图强度调节

## 使用方法

### 基本使用

```javascript
// 在 Ground 系统中，环境效果会在初始化时自动设置
const ground = new Ground(core);
// RoomEnvironment 会自动应用
```

### 动态切换环境

#### 地面系统 (Ground)
```javascript
// 切换到 RoomEnvironment
ground.setEnvironment("room");

// 切换到 HDR 环境
ground.setEnvironment("hdr");

// 切换到默认环境
ground.setEnvironment("default");
```

#### 室内系统 (IndoorSubsystem)
```javascript
// 切换到 RoomEnvironment
indoorSubsystem.setIndoorEnvironment("room");

// 切换到 HDR 环境
indoorSubsystem.setIndoorEnvironment("hdr");

// 切换到默认环境
indoorSubsystem.setIndoorEnvironment("default");
```

### 自定义环境设置

```javascript
// 设置环境效果并传入配置选项
ground.setEnvironment("room", {
  intensity: 0.8, // 环境贴图强度
  // 其他配置选项...
});
```

## API 参考

### `setEnvironment(type, options)`

设置场景的环境效果。

**参数:**

- `type` (string): 环境类型
  - `'room'`: RoomEnvironment
  - `'hdr'`: HDR 环境贴图
  - `'default'`: 默认环境
- `options` (object): 配置选项（可选）

**示例:**

```javascript
ground.setEnvironment("room");
```

### `clearEnvironment()`

清理当前的环境贴图资源。

**示例:**

```javascript
ground.clearEnvironment();
```

### `updateAllMaterialsEnvironment()`

更新场景中所有材质的环境贴图。

**示例:**

```javascript
ground.updateAllMaterialsEnvironment();
```

### `setupMaterialEnvironment(material)`

为单个材质设置环境贴图。

**参数:**

- `material` (THREE.Material): 要设置的材质

**示例:**

```javascript
const material = new THREE.MeshStandardMaterial();
ground.setupMaterialEnvironment(material);
```

### `setIndoorEnvironment(type)` (室内系统)

设置室内场景的环境效果。

**参数:**

- `type` (string): 环境类型
  - `'room'`: RoomEnvironment
  - `'hdr'`: HDR 环境贴图
  - `'default'`: 默认环境

**示例:**

```javascript
indoorSubsystem.setIndoorEnvironment("room");
```

## 材质要求

为了获得最佳的环境效果，建议使用以下材质类型：

1. **MeshStandardMaterial**: 标准 PBR 材质
2. **MeshPhysicalMaterial**: 物理 PBR 材质

这些材质会自动获得环境贴图支持。

## 性能优化

### 1. 资源管理

- 环境贴图会在系统销毁时自动清理
- 切换环境时会先清理旧资源再设置新资源

### 2. 材质更新

- 只在必要时更新材质的环境贴图
- 使用 `material.needsUpdate = true` 确保更新生效

### 3. 渲染优化

- 环境贴图使用立方体贴图格式，性能较好
- 支持 WebGL 的纹理压缩

## 测试

可以使用提供的测试页面 `test-room-environment.html` 来验证环境效果：

1. 打开测试页面
2. 使用控制按钮切换不同的环境效果
3. 观察材质的光照和反射变化

## 注意事项

1. **兼容性**: 需要支持 WebGL 2.0 的浏览器
2. **性能**: 环境贴图会增加一定的渲染开销
3. **内存**: 大型环境贴图会占用较多内存
4. **材质**: 只有支持 PBR 的材质才能正确显示环境效果

## 故障排除

### 环境贴图不显示

1. 检查材质是否为 `MeshStandardMaterial` 或 `MeshPhysicalMaterial`
2. 确认 `material.envMapIntensity` 不为 0
3. 检查 `material.needsUpdate` 是否设置为 `true`

### 性能问题

1. 降低环境贴图的分辨率
2. 减少环境贴图的强度
3. 使用更简单的环境类型

### 内存泄漏

1. 确保在系统销毁时调用 `clearEnvironment()`
2. 检查是否正确处理了材质的 `dispose()` 方法

## 更新日志

- **v1.0.0**: 初始集成 RoomEnvironment 功能
- 支持三种环境类型切换
- 自动材质环境贴图设置
- 完整的资源管理机制
