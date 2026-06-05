import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeatherDisplay({ data, screenWidth }) {
  const { location, data: weather } = data;

  // 根据屏幕宽度动态缩放
  const scale = Math.min(screenWidth / 375, 1.4);

  const getWeatherIcon = (id) => {
    if (id >= 200 && id < 300) return '⛈️';
    if (id >= 300 && id < 400) return '🌧️';
    if (id >= 500 && id < 600) return '🌦️';
    if (id >= 600 && id < 700) return '❄️';
    if (id >= 700 && id < 800) return '🌫️';
    if (id === 800) return '☀️';
    return '☁️';
  };

  const icon = weather.weather ? getWeatherIcon(weather.weather[0].id) : '🌤️';
  const temp = weather.main?.temp ?? weather.temp ?? '--';

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={[styles.location, { fontSize: Math.round(22 * scale) }]}>
          {location}
        </Text>
        <Text style={[styles.date, { fontSize: Math.round(15 * scale) }]}>
          {weather.dateLabel}
        </Text>
        <Text style={[styles.icon, { fontSize: Math.round(56 * scale) }]}>
          {icon}
        </Text>
        <Text style={[styles.temp, { fontSize: Math.round(44 * scale) }]}>
          {Math.round(temp)}°C
        </Text>
        <Text style={[styles.desc, { fontSize: Math.round(17 * scale) }]}>
          {weather.weather?.[0]?.description || '天气信息'}
        </Text>

        {/* 额外天气详情 */}
        {weather.main != null && (
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { fontSize: Math.round(13 * scale) }]}>
                💧 湿度
              </Text>
              <Text style={[styles.detailValue, { fontSize: Math.round(14 * scale) }]}>
                {weather.main.humidity}%
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { fontSize: Math.round(13 * scale) }]}>
                🌬️ 风速
              </Text>
              <Text style={[styles.detailValue, { fontSize: Math.round(14 * scale) }]}>
                {weather.wind?.speed ?? '--'} m/s
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  location: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    color: '#666',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 8,
  },
  temp: {
    fontWeight: '600',
    marginBottom: 4,
  },
  desc: {
    color: '#555',
    marginBottom: 20,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: '500',
    color: '#333',
  },
});
