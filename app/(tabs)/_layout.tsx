import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePalette } from '@/hooks/use-palette';

type IconSymbolName = React.ComponentProps<typeof IconSymbol>['name'];

/** Icon + small dot indicator when the tab is focused, matching the nav design. */
function TabIcon({ name, color, focused }: { name: IconSymbolName; color: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <IconSymbol size={26} name={name} color={color} />
      {focused ? <View style={[styles.dot, { backgroundColor: color }]} /> : <View style={styles.dotSpacer} />}
    </View>
  );
}

export default function TabLayout() {
  const theme = usePalette();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.cardBg,
          borderTopColor: theme.cardBorder,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon name="house.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Meds',
          tabBarIcon: ({ color, focused }) => <TabIcon name="cross.case.fill" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI Care',
          tabBarIcon: ({ color, focused }) => <TabIcon name="brain.head.profile" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabIcon name="person.fill" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotSpacer: {
    width: 4,
    height: 4,
  },
});
