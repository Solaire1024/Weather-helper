// App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';
import Header from './components/Header';
import Footer from './components/Footer';
import WeatherDisplay from './components/WeatherDisplay';

// 🔑 从环境变量读取 API Key，复制 .env.example → .env 并填入你自己的 Key
const DASHSCOPE_API_KEY = process.env.EXPO_PUBLIC_DASHSCOPE_API_KEY;
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

export default function App() {
  const { width, height } = useWindowDimensions();
  const [userQuery, setUserQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // 使用 DashScope 兼容模式解析用户输入
  const parseUserQueryWithQwen = async (query) => {
    const prompt = `
你是一个天气助手。请从用户的自然语言中提取两个信息：
1. 地点（location）：必须是具体地名
2. 日期（date）：只能是 "today"、"tomorrow"、"after_tomorrow" 或 "unknown"

请严格按 JSON 格式输出，不要任何其他文字。

示例：
输入：明天去上海迪士尼玩
输出：{"location":"上海迪士尼","date":"tomorrow"}

现在处理这个输入：
"${query}"
`;

    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      const msg = data.error?.message || '模型调用失败，请检查 API Key 和网络';
      throw new Error(msg);
    }

    let content = data.choices[0].message.content.trim();

    // 清理可能的 Markdown 代码块
    if (content.startsWith('```json')) {
      content = content.slice(7, content.lastIndexOf('```')).trim();
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error('模型返回格式错误，无法解析');
    }
  };

  // 获取经纬度
  const getCoordinates = async (location) => {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(geoUrl);
    const geoData = await res.json();
    if (geoData.length === 0) throw new Error('地点未找到，请尝试更具体的地名');
    return { lat: geoData[0].lat, lon: geoData[0].lon };
  };

  // 获取天气（使用免费 5 天/3 小时间隔预报 API）
  const getWeather = async (lat, lon) => {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(forecastUrl);
    const data = await res.json();
    if (data.cod !== '200') {
      throw new Error(data.message || '天气数据获取失败');
    }
    return data;
  };

  // 反向地理编码：根据坐标获取地名
  const reverseGeocode = async (lat, lon) => {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length === 0) return '当前位置';
    return data[0].local_names?.zh || data[0].name || '当前位置';
  };

  // 从预报列表中提取某一天的天气（取最接近中午 12 点的条目）
  const pickDayWeather = (list, targetDate, label) => {
    const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const groupByDay = {};
    list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      if (!groupByDay[dayKey]) groupByDay[dayKey] = [];
      groupByDay[dayKey].push(item);
    });

    const dayItems = groupByDay[targetDay.getTime()];
    if (!dayItems || dayItems.length === 0) return null;

    const midday = dayItems.reduce((best, item) => {
      const hour = new Date(item.dt * 1000).getHours();
      return Math.abs(hour - 12) < Math.abs(new Date(best.dt * 1000).getHours() - 12) ? item : best;
    });

    return { ...midday, dateLabel: label };
  };

  // 进入页面时自动获取当前位置天气
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setInitialLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const locationName = await reverseGeocode(latitude, longitude);
        const weather = await getWeather(latitude, longitude);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const displayData = pickDayWeather(weather.list, today, '今天');

        if (displayData) {
          setWeatherData({ location: locationName, data: displayData });
        }
      } catch (err) {
        console.log('自动定位失败:', err.message);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  // 主查询逻辑
  const handleWeatherQuery = async () => {
    const trimmed = userQuery.trim();
    if (!trimmed) {
      Alert.alert('提示', '请输入查询内容');
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      // Step 1: 用 Qwen 解析
      const parsed = await parseUserQueryWithQwen(trimmed);
      if (!parsed.location) throw new Error('未识别到地点');

      // Step 2: 获取坐标
      const coords = await getCoordinates(parsed.location);

      // Step 3: 获取天气
      const weather = await getWeather(coords.lat, coords.lon);

      // Step 4: 根据日期确定目标日并提取天气
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const afterTomorrow = new Date(today);
      afterTomorrow.setDate(afterTomorrow.getDate() + 2);

      let targetDate, label;
      switch (parsed.date) {
        case 'today': targetDate = today; label = '今天'; break;
        case 'tomorrow': targetDate = tomorrow; label = '明天'; break;
        case 'after_tomorrow': targetDate = afterTomorrow; label = '后天'; break;
        default: targetDate = today; label = '当前';
      }

      const displayData = pickDayWeather(weather.list, targetDate, label);
      if (!displayData) throw new Error('暂无该日期的天气数据');

      setWeatherData({
        location: parsed.location,
        data: displayData,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || initialLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {initialLoading ? '正在获取当前位置天气...' : '正在智能解析...'}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (weatherData) {
      return <WeatherDisplay data={weatherData} screenWidth={width} screenHeight={height} />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Header title="AI 智能天气助手" />

      <View style={styles.body}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="例如：明天北京天气怎么样？"
            value={userQuery}
            onChangeText={setUserQuery}
            onSubmitEditing={handleWeatherQuery}
          />
          <Button title="查询" onPress={handleWeatherQuery} />
        </View>

        <View style={styles.contentArea}>
          {renderContent()}
        </View>
      </View>

      <Footer authorName="Xie Xiaoyang" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  contentArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 15,
    textAlign: 'center',
  },
});
