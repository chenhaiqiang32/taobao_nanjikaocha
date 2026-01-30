import { ShaderChunk } from "three";
import { SHADER_UNIFORM, SHADER_END } from "../parameters";

/**
 * 菲涅尔混合效果 - 将菲涅尔颜色与原始材质颜色混合
 * @param strength 效果系数（控制边缘强度）
 * @param uColor 菲涅尔边缘颜色
 * @param fresnelIntensity 菲涅尔效果强度（0-1）
 */

// 需要增加uniform参数时需要自己定义，然后在使用shaderModify函数时在第三个参数内传入同名的参数
// 比如定义了strength，需要在参数内加入{strength:1.5}或者 {strength:{value:1.5}}

ShaderChunk.effect_uniform_fresnelBlend = /* glsl */ `
uniform float strength;
uniform vec3 uColor;
uniform float fresnelIntensity;
`;

ShaderChunk.effect_fragment_fresnelBlend = /* glsl */ `
vec3 viewDir = normalize(cameraPosition - mPosition.xyz);
float fresnelFactor = 1.0 - dot(mNormal, viewDir);
float fresnel = pow(fresnelFactor, strength);

// 计算菲涅尔效果的强度（边缘更明显）
float fresnelStrength = fresnel * fresnelIntensity;

// 将菲涅尔颜色与原始颜色混合
// 使用线性插值混合，边缘处显示菲涅尔颜色，中心保持原色
gl_FragColor.rgb = mix(gl_FragColor.rgb, uColor, fresnelStrength);
`;

// 导出结果
export const fresnelBlend = {
  uniform: { // uniform部分
    shader: "effect_uniform_fresnelBlend",
    location: SHADER_UNIFORM // 插入代码块的锚点 此处表示在uniform内插入，默认在#<common>后面插入
  },
  chunk: { // main函数部分 chunk可以是数组
    shader: "effect_fragment_fresnelBlend",
    location: SHADER_END // 插入代码块的锚点 此处表示在着色器尾处插入
  },
};

