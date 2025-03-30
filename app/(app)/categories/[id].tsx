import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface CategoryDetails {
  id: number;
  parent_id: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  product_count: number;
  children_data: any[];
  created_at: string;
  updated_at: string;
  path: string;
  available_sort_by: string[];
  include_in_menu: boolean;
  custom_attributes: {
    attribute_code: string;
    value: string;
  }[];
}

export default function CategoryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getCategoryDetails(user?.token || '', id as string);
      setCategory(response);
    } catch (error: any) {
      console.error('Error fetching category details:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load category details',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderSection('Basic Information', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ID:</Text>
              <Text style={styles.value}>{category.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{category.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: category.is_active ? '#34C759' : '#FF3B30' }
              ]}>
                <Text style={styles.statusText}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Position:</Text>
              <Text style={styles.value}>{category.position}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Level:</Text>
              <Text style={styles.value}>{category.level}</Text>
            </View>
            {/* <View style={styles.infoRow}>
              <Text style={styles.label}>Products:</Text>
              <Text style={styles.value}>{category.product_count}</Text>
            </View> */}
          </>
        ))}

        {renderSection('Menu Settings', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Include in Menu:</Text>
              <Text style={styles.value}>{category.include_in_menu ? 'Yes' : 'No'}</Text>
            </View>
            {/*              */}
          </>
        ))}

        {renderSection('Dates', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created:</Text>
              <Text style={styles.value}>
                {new Date(category.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Updated:</Text>
              <Text style={styles.value}>
                {new Date(category.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </>
        ))}

        {category.custom_attributes && category.custom_attributes.length > 0 && (
          renderSection('Additional Information', (
            <>
              {category.custom_attributes.map((attr, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.label}>
                    {attr.attribute_code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </Text>
                  <Text style={styles.value}>{attr.value}</Text>
                </View>
              ))}
            </>
          ))
        )}

        {/* {category.children_data && category.children_data.length > 0 && (
          renderSection('Subcategories', (
            <>
              {category.children_data.map((child, index) => (
                <View key={index} style={styles.subcategoryCard}>
                  <Text style={styles.subcategoryName}>{child.name}</Text>
                  <Text style={styles.subcategoryCount}>
                    {child.product_count} products
                  </Text>
                </View>
              ))}
            </>
          ))
        )} */}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subcategoryName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  subcategoryCount: {
    fontSize: 14,
    color: '#666',
  },
}); 