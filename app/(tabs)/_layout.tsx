import { Tabs } from 'expo-router';
import React from 'react';
import AnimatedTabBar from '../../src/components/AnimatedTabBar';
import { translations } from '../../src/store/translations';
import { useStore } from '../../src/store/useStore';

export default function TabLayout() {
  const language = useStore((s) => s.language);
  const t = translations[language].tabs;

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.overview,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: t.timeline,
        }}
      />
      <Tabs.Screen
        name="spending"
        options={{
          title: t.spending,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
        }}
      />
    </Tabs>
  );
}
