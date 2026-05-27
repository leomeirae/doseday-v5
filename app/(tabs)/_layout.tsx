import { Tabs } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@lib/theme/tokens'
import { TabBarButton } from '@components/ui/TabBarButton'
import { TabBarBackground } from '@components/ui/TabBarBackground'

const TAB_BAR_HEIGHT = 49

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          display: 'none',
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          lineHeight: 14,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarAccessibilityLabel: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'house.fill' : 'house'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="doses"
        options={{
          title: 'Doses',
          tabBarAccessibilityLabel: 'Doses',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'cross.case.fill' : 'cross.case'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diário',
          tabBarAccessibilityLabel: 'Diário',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'book.closed.fill' : 'book.closed'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarAccessibilityLabel: 'Relatórios',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'chart.bar.fill' : 'chart.bar'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  )
}
