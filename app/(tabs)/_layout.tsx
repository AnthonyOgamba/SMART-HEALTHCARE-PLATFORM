import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePalette } from "@/hooks/use-palette";

type IconSymbolName = React.ComponentProps<typeof IconSymbol>["name"];

function TabIcon({
  name,
  color,
}: {
  name: IconSymbolName;
  color: string;
}) {
  return (
    <View style={styles.iconWrap}>
      <IconSymbol size={26} name={name} color={color} />
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
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({ color }) => (
            <TabIcon name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: "Schedule",

          tabBarIcon: ({ color }) => (
            <TabIcon name="calendar" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: "Genie Cares",

          tabBarIcon: ({ color }) => (
            <TabIcon
              name="brain.head.profile"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color }) => (
            <TabIcon name="person.fill" color={color} />
          ),
        }}
      />

      {/* Internal screen, accessible from Home but hidden from tab bar */}
      <Tabs.Screen
        name="symptoms"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    gap: 3,
  },

});
