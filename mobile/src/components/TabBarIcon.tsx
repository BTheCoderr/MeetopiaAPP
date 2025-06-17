import React from 'react';
import {View} from 'react-native';

// For now, using a simple View as placeholder
// In a real app, you'd use react-native-vector-icons or similar
interface TabBarIconProps {
  name: string;
  focused: boolean;
  color: string;
  size?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({name, focused, color, size = 24}) => {
  // Placeholder icon - replace with actual icon library
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        opacity: focused ? 1 : 0.6,
      }}
    />
  );
};

export default TabBarIcon; 