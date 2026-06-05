# 🌤️ AI 智能天气助手

一个基于 **Expo + React Native** 的跨平台天气查询应用。输入自然语言即可查询任意地点今天、明天、后天的天气，打开应用自动显示当前位置天气。

## ✨ 功能

- 🗣️ **自然语言查询** — 输入"明天去上海迪士尼玩"，AI 自动解析出地点和日期
- 📍 **自动定位** — 首次打开自动获取当前位置并显示当天天气
- 🌍 **跨平台** — Web / iOS / Android 均可运行
- 🎨 **简洁 UI** — 卡片式天气展示，天气图标一目了然

## 🏗️ 技术架构

```
用户输入（自然语言）
    │
    ▼
DashScope（千问 Qwen）解析 → { location, date }
    │
    ▼
OpenWeather Geocoding API → 经纬度
    │
    ▼
OpenWeather Forecast API → 5天/3小时预报
    │
    ▼
按天分组 + 选取代表时段 → 展示天气卡片
```

| 服务 | 用途 |
|------|------|
| [DashScope](https://dashscope.console.aliyun.com/)（千问） | 自然语言解析，提取地点和日期 |
| [OpenWeather](https://openweathermap.org/) | 地理编码 + 天气预报 |
| [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) | 获取设备 GPS 定位 |

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env
```

然后编辑 `.env` 文件，填入你自己的 API Key：

```env
# 千问 DashScope API Key（从 https://dashscope.console.aliyun.com/ 获取）
EXPO_PUBLIC_DASHSCOPE_API_KEY=你的千问_API_Key

# OpenWeather API Key（从 https://openweathermap.org/ 获取，免费套餐即可）
EXPO_PUBLIC_OPENWEATHER_API_KEY=你的_OpenWeather_Key
```

> ⚠️ `.env` 已被 `.gitignore` 忽略，不会提交到 Git，确保 API Key 安全。
> OpenWeather 使用免费套餐的 **5 Day / 3 Hour Forecast** 接口即可，无需付费订阅。

```bash
# 3. 启动项目
npm start          # Expo 开发服务器（扫码在手机上运行）
npm run web        # 浏览器运行
npm run ios        # iOS 模拟器
npm run android    # Android 模拟器
```

### 在手机上运行

1. 手机安装 [Expo Go](https://expo.dev/go) 应用
2. 运行 `npm start`，终端会显示二维码
3. 用 Expo Go 扫码即可

## 📁 项目结构

```
weather-helper/
├── App.js                      # 主组件：状态管理 + 业务逻辑
├── index.js                    # 入口文件
├── app.json                    # Expo 配置
├── package.json                # 依赖与脚本
├── .env.example                # API Key 配置模板
├── components/
│   ├── Header.js               # 顶部标题栏
│   ├── Footer.js               # 底部版权信息
│   └── WeatherDisplay.js       # 天气卡片展示
└── assets/                     # 图标与启动画面
```

## 📱 界面预览

输入 "明天北京天气怎么样？" → 展示：

```
┌─────────────────────┐
│ 北京               │
│ 明天               │
│        ☀️          │
│      26°C          │
│    晴，少云        │
└─────────────────────┘
```

## 📄 License

0BSD
