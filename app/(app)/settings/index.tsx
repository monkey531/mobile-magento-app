import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface SettingItem {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'toggle' | 'button';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const settingsItems: SettingItem[] = [
    {
      title: 'Notifications',
      icon: 'notifications',
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      title: 'Dark Mode',
      icon: 'moon',
      type: 'toggle',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      title: 'Profile',
      icon: 'person',
      type: 'button',
      onPress: () => console.log('Profile pressed'),
    },
    {
      title: 'Change Password',
      icon: 'key',
      type: 'button',
      onPress: () => console.log('Change password pressed'),
    },
    {
      title: 'About',
      icon: 'information-circle',
      type: 'button',
      onPress: () => console.log('About pressed'),
    },
    {
      title: 'Logout',
      icon: 'log-out',
      type: 'button',
      onPress: handleLogout,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingItem}
      onPress={item.type === 'button' ? item.onPress : undefined}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
        <Text style={styles.settingItemText}>{item.title}</Text>
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.value ? '#007AFF' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#999" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            {settingsItems.slice(0, 2).map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            {settingsItems.slice(2, 4).map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            {settingsItems.slice(4, 5).map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {settingsItems.slice(5).map(renderSettingItem)}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
}); 