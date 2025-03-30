import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const BASE_URL = 'https://www.wholesale-supplier.uk';
const MAX_IMAGES = 5;

export default function EditProductScreen() {
  const { sku } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<{
    uri: string;
    base64: string;
    position: number;
  }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    status: 1 as 0 | 1,
    weight: '',
    description: '',
  });

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const product = await api.getProductDetails(user?.token || '', sku as string);
      
      // Find description from custom attributes
      const description = product.custom_attributes?.find(
        attr => attr.attribute_code === 'description'
      )?.value || '';

      setFormData({
        name: product.name,
        price: product.price.toString(),
        status: product.status as 0 | 1,
        weight: product.weight.toString(),
        description,
      });

      // Sort images by position
      const sortedImages = [...(product.media_gallery_entries || [])].sort(
        (a, b) => a.position - b.position
      );
      setExistingImages(sortedImages);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to add images.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const totalImages = existingImages.length + newImages.length;
        if (totalImages >= MAX_IMAGES) {
          Alert.alert('Error', `Maximum ${MAX_IMAGES} images allowed`);
          return;
        }

        const newImage = {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || '',
          position: totalImages,
        };
        setNewImages([...newImages, newImage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeExistingImage = async (imageId: number) => {
    try {
      // For now, we'll just remove it from the state
      // TODO: Implement image deletion in the API
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      
      // Reorder remaining images
      const updatedImages = existingImages
        .filter(img => img.id !== imageId)
        .map((img, index) => ({
          ...img,
          position: index,
        }));
      setExistingImages(updatedImages);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove image');
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prevImages => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      // Update positions for remaining new images
      return updatedImages.map((img, i) => ({
        ...img,
        position: existingImages.length + i,
      }));
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.name.trim() || !formData.price.trim()) {
        Alert.alert('Error', 'Name and price are required');
        return;
      }

      // First update the product details
      const productData = {
        product: {
          name: formData.name,
          price: parseFloat(formData.price),
          status: formData.status,
          weight: parseFloat(formData.weight),
          description: formData.description,
          custom_attributes: [
            {
              attribute_code: 'description',
              value: formData.description,
            },
          ],
        },
      };

      await api.updateProduct(user?.token || '', sku as string, productData);

      // Then upload any new images
      for (const image of newImages) {
        await api.uploadProductImage(
          user?.token || '',
          sku as string,
          image.base64,
          image.position
        );
      }

      Alert.alert('Success', 'Product updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={styles.headerTitle}>Edit Product</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Images</Text>
            <View style={styles.imageGrid}>
              {existingImages.map((image, index) => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image
                    source={{ uri: `${BASE_URL}/media/catalog/product${image.file}` }}
                    style={styles.image}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeExistingImage(image.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.mainImageBadge}>
                      <Text style={styles.mainImageText}>Main</Text>
                    </View>
                  )}
                </View>
              ))}
              {newImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeNewImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              {existingImages.length + newImages.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImage}
                >
                  <Ionicons name="add" size={40} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter product name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="Enter product price"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              placeholder="Enter product weight"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter product description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {formData.status === 1 ? 'Enabled' : 'Disabled'}
              </Text>
              <Switch
                value={formData.status === 1}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value ? 1 : 0 })
                }
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Product</Text>
            )}
          </TouchableOpacity>
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
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mainImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 