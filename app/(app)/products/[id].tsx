import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  useWindowDimensions,
  LogBox
} from 'react-native';
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface ProductDetails {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock_item: {
    stock_id: number
  };
  status: 0 | 1 | null;
  type_id: string;
  weight: number;
  created_at: string;
  updated_at: string;
  custom_attributes: {
    attribute_code: string;
    value: string;
  }[];
  media_gallery_entries: {
    id: number;
    media_type: string;
    label: string;
    position: number;
    disabled: boolean;
    file: string;
  }[];
}

const BASE_URL = 'https://www.wholesale-supplier.uk';

// Configure HTML rendering options
const htmlConfig = {
  enableExperimentalBRCollapsing: true,
  systemFonts: [...defaultSystemFonts, 'Arial', 'Helvetica'],
  baseStyle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 24
  }
};

const renderersProps = {
  img: {
    enableExperimentalPercentWidth: true
  }
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getProductDetails(user?.token || '', id as string);
      setProduct(response);
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load product details',
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

  const renderImageGallery = (product: ProductDetails) => (
    <View style={styles.imageGallery}>
      <Image
        source={{
          uri: `${BASE_URL}/media/catalog/product${product.media_gallery_entries[selectedImageIndex].file}`
        }}
        style={styles.mainImage}
        resizeMode="contain"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailContainer}
      >
        {product.media_gallery_entries.map((image, index) => (
          <TouchableOpacity
            key={image.id}
            style={[
              styles.thumbnailWrapper,
              selectedImageIndex === index && styles.selectedThumbnail
            ]}
            onPress={() => setSelectedImageIndex(index)}
          >
            <Image
              source={{ uri: `${BASE_URL}/media/catalog/product${image.file}` }}
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderAttribute = (attribute: ProductDetails['custom_attributes']) => (
    (attribute && attribute.length > 0) ?
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attributes</Text>
        <View style={styles.sectionContent}>
          {attribute.map((attr, index) => (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.label}>{attr.attribute_code}:</Text>
              <Text style={styles.value}>{attr.value}</Text>
            </View>
          ))}
        </View>
      </View>
      : <></>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const description = product.custom_attributes?.find(
    (attr: any) => attr.attribute_code === 'description'
  )?.value || 'No description available';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/products/edit/${product.sku}`)}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {product.media_gallery_entries && product.media_gallery_entries.length > 0 && (
          renderImageGallery(product)
        )}

        {renderSection('Basic Information', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{product.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>SKU:</Text>
              <Text style={styles.value}>{product.sku}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: product.status === 1 ? '#34C759' : '#FF3B30' }
              ]}>
                <Text style={styles.statusText}>{product.status === 1 ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{product.type_id}</Text>
            </View>
          </>
        ))}

        {renderSection('Pricing & Stock', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Price:</Text>
              <Text style={styles.value}>£{product.price.toFixed(2)}</Text>
            </View>
            {product.stock_item ?
              <View style={styles.infoRow}>
                <Text style={styles.label}>Stock:</Text>
                <Text style={[
                  styles.value,
                  product.stock_item.stock_id < 10 && styles.lowStock
                ]}>{product.stock_item.stock_id}</Text>
              </View>
              : <></>}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Weight:</Text>
              <Text style={styles.value}>{product.weight} kg</Text>
            </View>
          </>
        ))}

        {renderSection('Dates', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created:</Text>
              <Text style={styles.value}>
                {new Date(product.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Updated:</Text>
              <Text style={styles.value}>
                {new Date(product.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </>
        ))}

        {renderSection('Description', (
          <Text style={styles.description}>{description}</Text>
        ))}
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    padding: 8,
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
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  lowStock: {
    color: '#FF3B30',
  },
  imageGallery: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 15,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  thumbnailWrapper: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 4,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#007AFF',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
}); 