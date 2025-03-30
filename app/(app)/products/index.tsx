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
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BASE_URL = 'https://www.wholesale-supplier.uk';

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock_item: {
    stock_id: number;
  };
  status: 0 | 1 | null;
  type_id: string;
  media_gallery_entries: {
    id: number;
    media_type: string;
    label: string;
    position: number;
    disabled: boolean;
    file: string;
  }[];
}

export default function ProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<0 | 1 | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showPageList, setShowPageList] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts(user?.token || '', currentPage, 20, {
        status: filterStatus,
        search: searchQuery,
      });
      setProducts(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
    fetchProducts();
  };

  const handleFilter = (status: 0 | 1 | null) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchProducts();
  };

  const handleProductPress = (product: Product) => {
    if (isSelectionMode) {
      toggleProductSelection(product.sku);
    } else {
      router.push(`/products/${product.sku}`);
    }
  };

  const handleProductLongPress = (product: Product) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedProducts(new Set([product.sku]));
    } else {
      toggleProductSelection(product.sku);
    }
  };

  const toggleProductSelection = (sku: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(sku)) {
      newSelection.delete(sku);
    } else {
      newSelection.add(sku);
    }
    setSelectedProducts(newSelection);
    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleDeleteSelected = async () => {
    Alert.alert(
      'Delete Products',
      `Are you sure you want to delete ${selectedProducts.size} product(s)?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              for (const sku of selectedProducts) {
                await api.deleteProduct(user?.token || '', sku);
              }
              setSelectedProducts(new Set());
              setIsSelectionMode(false);
              fetchProducts();
              Alert.alert('Success', 'Products deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        isSelectionMode && selectedProducts.has(item.sku) && styles.selectedCard,
      ]}
      onPress={() => handleProductPress(item)}
      onLongPress={() => handleProductLongPress(item)}
    >
      {isSelectionMode && (
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectedProducts.has(item.sku) ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={selectedProducts.has(item.sku) ? '#007AFF' : '#666'}
          />
        </View>
      )}
      <View style={styles.productCardContent}>
        <Image
          source={{ uri: item.media_gallery_entries?.[0] ? `${BASE_URL}/media/catalog/product${item.media_gallery_entries[0].file}` : 'https://via.placeholder.com/100' }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.productPrice}>£{item.price.toFixed(2)}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 1 ? '#4CAF50' : '#FF3B30', alignItems: 'center', justifyContent: 'center' }
            ]}>
              <Text style={styles.statusText}>{item.status === 1 ? 'Enabled' : 'Disabled'}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterStatus === null && styles.filterButtonActive,
        ]}
        onPress={() => handleFilter(null)}
      >
        <Text style={[
          styles.filterButtonText,
          filterStatus === null && styles.filterButtonTextActive,
        ]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterStatus === 1 && styles.filterButtonActive,
        ]}
        onPress={() => handleFilter(1)}
      >
        <Text style={[
          styles.filterButtonText,
          filterStatus === 1 && styles.filterButtonTextActive,
        ]}>Enabled</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterStatus === 0 && styles.filterButtonActive,
        ]}
        onPress={() => handleFilter(0)}
      >
        <Text style={[
          styles.filterButtonText,
          filterStatus === 0 && styles.filterButtonTextActive,
        ]}>Disabled</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === 1 && styles.paginationButtonDisabled
        ]}
        onPress={() => {
          if (currentPage > 1) {
            setCurrentPage(1);
          }
        }}
        disabled={currentPage === 1}
      >
        <Ionicons name="play-back" size={20} color={currentPage === 1 ? '#999' : '#007AFF'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === 1 && styles.paginationButtonDisabled
        ]}
        onPress={() => {
          if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
        }}
        disabled={currentPage === 1}
      >
        <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#999' : '#007AFF'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pageInputContainer}
        onPress={() => setShowPageList(true)}
      >
        <Text style={styles.pageInput}>{currentPage}</Text>
        <Text style={styles.paginationText}>of {totalPages}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === totalPages && styles.paginationButtonDisabled
        ]}
        onPress={() => {
          if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
          }
        }}
        disabled={currentPage === totalPages}
      >
        <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#999' : '#007AFF'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === totalPages && styles.paginationButtonDisabled
        ]}
        onPress={() => {
          if (currentPage < totalPages) {
            setCurrentPage(totalPages);
          }
        }}
        disabled={currentPage === totalPages}
      >
        <Ionicons name="play-forward" size={20} color={currentPage === totalPages ? '#999' : '#007AFF'} />
      </TouchableOpacity>

      <Modal
        visible={showPageList}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPageList(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPageList(false)}
        >
          <View style={styles.pageListContainer}>
            <View style={styles.pageListHeader}>
              <Text style={styles.pageListTitle}>Select Page</Text>
              <TouchableOpacity
                onPress={() => setShowPageList(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Array.from({ length: totalPages }, (_, i) => i + 1)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pageListItem,
                    item === currentPage && styles.pageListItemActive
                  ]}
                  onPress={() => {
                    setCurrentPage(item);
                    setShowPageList(false);
                  }}
                >
                  <Text style={[
                    styles.pageListItemText,
                    item === currentPage && styles.pageListItemTextActive
                  ]}>
                    Page {item}
                  </Text>
                  {item === currentPage && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.pageListContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
        <Text style={styles.headerTitle}>Products</Text>
        {isSelectionMode ? (
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedProducts(new Set());
                setIsSelectionMode(false);
              }}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteSelected}
            >
              <Text style={styles.actionButtonText}>
                Delete ({selectedProducts.size})
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {renderFilterButtons()}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/products/add')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    gap: 8,
  },
  paginationButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  pageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pageInput: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  pageListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pageListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  pageListContent: {
    padding: 10,
  },
  pageListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  pageListItemActive: {
    backgroundColor: '#E3F2FD',
  },
  pageListItemText: {
    fontSize: 16,
    color: '#333',
  },
  pageListItemTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
}); 