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

interface CustomerDetails {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  created_at: string;
  group_id: number;
  store_id: number;
  website_id: number;
  addresses: {
    id: number;
    customer_id: number;
    region: {
      region_code: string;
      region: string;
      region_id: number;
    };
    region_id: number;
    country_id: string;
    street: string[];
    company: string;
    telephone: string;
    fax: string;
    postcode: string;
    city: string;
    firstname: string;
    lastname: string;
    middlename: string;
    prefix: string;
    suffix: string;
    vat_id: string;
    default_shipping: boolean;
    default_billing: boolean;
  }[];
  custom_attributes: {
    attribute_code: string;
    value: string;
  }[];
}

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getCustomerDetails(user?.token || '', id as string);
      setCustomer(response);
    } catch (error: any) {
      console.error('Error fetching customer details:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load customer details',
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

  const renderAddress = (address: CustomerDetails['addresses'][0], index: number) => (
    <View key={index} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressTitle}>
          {address.default_billing ? 'Default Billing' : address.default_shipping ? 'Default Shipping' : 'Address'}
        </Text>
        {address.default_billing && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Billing</Text>
          </View>
        )}
        {address.default_shipping && (
          <View style={[styles.badge, styles.shippingBadge]}>
            <Text style={styles.badgeText}>Shipping</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressText}>
        {address.firstname} {address.lastname}
        {address.company && `\n${address.company}`}
        {address.street.map((line, i) => `\n${line}`)}
        {`\n${address.city}, ${address.region.region} ${address.postcode}`}
        {`\n${address.country_id}`}
        {address.telephone && `\n${address.telephone}`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Customer not found</Text>
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
        <Text style={styles.headerTitle}>Customer Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderSection('Basic Information', (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {customer.firstname} {customer.lastname}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{customer.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Member Since:</Text>
              <Text style={styles.value}>
                {new Date(customer.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Group ID:</Text>
              <Text style={styles.value}>{customer.group_id}</Text>
            </View>
          </>
        ))}

        {customer.addresses.length > 0 && renderSection('Addresses', (
          <>
            {customer.addresses.map((address, index) => renderAddress(address, index))}
          </>
        ))}

        {customer.custom_attributes && customer.custom_attributes.length > 0 && (
          renderSection('Additional Information', (
            <>
              {customer.custom_attributes.map((attr, index) => (
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
  addressCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shippingBadge: {
    backgroundColor: '#34C759',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 