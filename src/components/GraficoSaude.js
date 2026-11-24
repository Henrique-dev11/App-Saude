import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Polyline, Circle, Line } from 'react-native-svg';
import { colors, spacing } from '../theme';
const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
export default function Chart({ values, color, label }) {
  const min = Math.min(...values) - 6, max = Math.max(...values) + 6;
  const points = values.map((v, i) => [12 + i * 46, 64 - (v - min) / (max - min) * 48]);
  return <View accessible accessibilityRole="image" accessibilityLabel={`${label}: ${values.join(', ')}`}>
    <Svg width="100%" height={88} viewBox="0 0 300 88" preserveAspectRatio="none" accessible={false}>
      {[20, 44, 68].map(y => <Line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#EBF0F5" strokeDasharray="3 5" />)}
      <Path d={`M${points[0].join(' ')} ${points.slice(1).map(p => `L${p.join(' ')}`).join(' ')} L288 82 L12 82Z`} fill={color} opacity={0.06} />
      <Polyline points={points.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2.5" />
      {points.map(([cx, cy], i) => <Circle key={i} cx={cx} cy={cy} r={i === 6 ? 4 : 2} fill={color} />)}
    </Svg>
    <View style={styles.dias}>{days.map((d, i) => <Text key={i} style={styles.legenda}>{d}</Text>)}</View>
  </View>;
}

const styles = StyleSheet.create({ dias: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }, legenda: { color: colors.textMuted, fontSize: 12 } });
