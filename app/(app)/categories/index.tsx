import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Category {
  id: number;
  parent_id: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  product_count: number;
  children_data: Category[];
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories(user?.token || '', currentPage);
      setCategories(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load categories',
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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderCategoryItem = ({ item, level = 0 }: { item: Category; level?: number }) => {
    const isExpanded = expandedCategories.includes(item.id);
    const hasChildren = item.children_data && item.children_data.length > 0;

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.categoryCard,
            { marginLeft: 15 + ((level-1) * 20) }
          ]}
          onPress={() => {
            if (hasChildren) {
              toggleCategory(item.id);
            } else {
              router.push(`/categories/${item.id}` as any);
            }
          }}
        >
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              {hasChildren && (
                <Ionicons
                  name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                  size={20}
                  color="#666"
                  style={styles.expandIcon}
                />
              )}
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            <View style={styles.categoryStats}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.is_active ? '#34C759' : '#FF3B30' }
              ]}>
                <Text style={styles.statusText}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.productCount}>
                {item.product_count} products
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {isExpanded && hasChildren && (
          <View>
            {item.children_data.map(child => (
              <View key={child.id}>
                {renderCategoryItem({ item: child, level: level + 1 })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const filteredCategories = categories.filter(category => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (cat: Category): boolean => {
      const matches = cat.name.toLowerCase().includes(searchLower);
      if (cat.children_data) {
        return matches || cat.children_data.some(matchesSearch);
      }
      return matches;
    };
    return matchesSearch(category);
  });

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === 1 && styles.paginationButtonDisabled
        ]}
        onPress={handlePrevPage}
        disabled={currentPage === 1}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={currentPage === 1 ? '#999' : '#007AFF'}
        />
      </TouchableOpacity>
      <Text style={styles.paginationText}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === totalPages && styles.paginationButtonDisabled
        ]}
        onPress={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={currentPage === totalPages ? '#999' : '#007AFF'}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={({ item }) => renderCategoryItem({ item })}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {renderPagination()}
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
    paddingTop: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productCount: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paginationButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  paginationText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
}); 