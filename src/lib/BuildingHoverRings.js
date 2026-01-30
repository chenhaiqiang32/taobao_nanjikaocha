import * as THREE from "three";

/**
 * 建筑悬停时显示的环形圆圈效果
 * 包含两个不断上下波动的环形圆圈
 */
export class BuildingHoverRings extends THREE.Group {
  constructor() {
    super();

    this.name = "BuildingHoverRings";
    this.visible = false;

    // 动画相关属性
    this.elapsedTime = 0;
    this.animationSpeed = 140.0; // 增加运动速度
    this.waveAmplitude = 2.0; // 波动幅度
    this.ringSpacing = 2.0; // 两个圆圈之间的间距

    this.createRings();
  }

  createRings() {
    // 创建第一个环形圆圈
    this.ring1 = this.createSingleRing(12, "#00ff88", 0.6);
    this.ring1.position.y = 0;
    this.add(this.ring1);

    // 创建第二个环形圆圈（稍大一些）
    this.ring2 = this.createSingleRing(16, "#0088ff", 0.4);
    this.ring2.position.y = 0;
    this.add(this.ring2);
  }

  createSingleRing(radius, color, opacity) {
    // 创建环形几何体
    const geometry = new THREE.RingGeometry(radius * 0.8, radius, 32);

    // 旋转几何体使其水平放置
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // 创建材质
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false, // 不进行深度测试，避免被模型遮挡
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uRadius: { value: radius },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uRadius;
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
          vUv = uv;
          
          // 计算顶点到中心的距离
          vec2 center = vec2(0.5, 0.5);
          vDistance = distance(uv, center) * 2.0;
          
          vec3 pos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
          // 创建环形效果
          float ring = 1.0 - smoothstep(0.7, 1.0, vDistance);
          ring *= smoothstep(0.3, 0.5, vDistance);
          
          // 添加脉冲效果
          float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
          
          // 添加扫描线效果
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float scanLine = sin(angle * 8.0 + uTime * 4.0) * 0.2 + 0.8;
          
          float alpha = ring * pulse * scanLine * uOpacity;
          
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 999; // 设置高渲染顺序，确保不被遮挡
    return mesh;
  }

  /**
   * 显示环形圆圈在指定位置
   * @param {THREE.Vector3} position 显示位置
   * @param {number} radius 包围盒半径，用于调整圆圈大小
   */
  show(position, radius = 12) {
    this.position.copy(position);
    this.position.y += 1; // 稍微抬高一点

    // 根据包围盒半径调整圆圈大小
    const scaleFactor = Math.max(0.3, Math.min(3.0, radius)); // 缩放范围 0.3-3.0，基准半径15
    this.scale.setScalar(scaleFactor);

    this.visible = true;
  }

  /**
   * 隐藏环形圆圈
   */
  hide() {
    this.visible = false;
  }

  /**
   * 更新动画
   * @param {number} deltaTime 时间增量
   */
  update(deltaTime) {
    if (!this.visible) return;

    this.elapsedTime += deltaTime;

    // 更新材质的时间uniform
    if (this.ring1 && this.ring1.material) {
      this.ring1.material.uniforms.uTime.value = this.elapsedTime;
    }
    if (this.ring2 && this.ring2.material) {
      this.ring2.material.uniforms.uTime.value = this.elapsedTime;
    }

    // 添加上下波动动画 - 增加相位差让交替运动更明显
    const wave1 =
      Math.sin(this.elapsedTime * this.animationSpeed) * this.waveAmplitude;
    const wave2 =
      Math.sin(this.elapsedTime * this.animationSpeed + Math.PI) *
      this.waveAmplitude; // 相位差180度，完全相反运动

    if (this.ring1) {
      this.ring1.position.y = wave1;
    }
    if (this.ring2) {
      this.ring2.position.y = wave2 + this.ringSpacing;
    }

    // 添加旋转效果
    this.rotation.y += deltaTime * 0.5;
  }

  /**
   * 销毁资源
   */
  dispose() {
    this.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          child.material.dispose();
        }
      }
    });
  }
}
