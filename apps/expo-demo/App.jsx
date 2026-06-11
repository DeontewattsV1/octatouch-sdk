import React, { useMemo, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { OctaTabBar } from '../../platforms/expo/src/index';
import { octaThemes } from '../../platforms/expo/src/theme/presets';
import { createOctaTouchEngineClient } from './src/runtime/octatouchEngineClient';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlaygroundScreen } from './src/screens/PlaygroundScreen';
import { SafetyScreen } from './src/screens/SafetyScreen';

const tabs = [
  { key: 'home', label: 'Home' },
  { key: 'playground', label: 'Playground', badge: 8 },
  { key: 'safety', label: 'Safety' },
];

export default function App() {
  const theme = useMemo(() => octaThemes.midnight, []);
  const engine = useMemo(() => createOctaTouchEngineClient(), []);
  const [activeTab, setActiveTab] = useState('home');
  const [context, setContext] = useState({
    vehicleState: 'parked',
    accessibility: {
      screenReaderActive: false,
      zoomActive: false,
      switchControlActive: false,
    },
  });
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleResult = (result) => {
    setLastResult(result);
    setHistory((current) => [result, ...current].slice(0, 10));
  };

  let body = null;
  if (activeTab === 'home') {
    body = <HomeScreen theme={theme} context={context} lastResult={lastResult} engine={engine} />;
  } else if (activeTab === 'playground') {
    body = <PlaygroundScreen theme={theme} context={context} onResult={handleResult} history={history} engine={engine} />;
  } else {
    body = (
      <SafetyScreen
        theme={theme}
        context={context}
        onChangeContext={setContext}
        lastResult={lastResult}
        engine={engine}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>{body}</View>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, backgroundColor: theme.colors.background }}>
        <OctaTabBar theme={theme} items={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
