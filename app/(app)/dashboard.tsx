import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import LogoImg from '@/components/LogoImg';

interface Stats {
  total_orders: number;
  total_customers: number;
  total_products: number;
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const menuItems = [
    {
      title: 'Orders',
      icon: 'cart',
      onPress: () => router.push('/orders'),
    },
    {
      title: 'Products',
      icon: 'cube',
      onPress: () => router.push('/products'),
    },
    {
      title: 'Customers',
      icon: 'people',
      onPress: () => router.push('/customers'),
    },
    {
      title: 'Categories',
      icon: 'folder',
      onPress: () => router.push('/categories'),
    },
    {
      title: 'Reports',
      icon: 'bar-chart',
      onPress: () => router.push('/reports' as any),
    },
    {
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => router.push('/settings' as any),
    },
  ];

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: '#007AFF' }]}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{stats.total_orders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: '#34C759' }]}>
          <Ionicons name="people-outline" size={24} color="#fff" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{stats.total_customers}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: '#FF9500' }]}>
          <Ionicons name="cube-outline" size={24} color="#fff" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{stats.total_products}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.getStats(user?.token || '');
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LogoImg />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          renderStats()
        )}

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon as any} size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
}); 