<<<<<<< HEAD
import React, { useState } from 'react';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
=======
import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSession } from '@/providers/AuthProvider';
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.replace('/dashboard');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid username or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Admin Login</Text>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {/* Username Input */}
      <View style={styles.inputContainer}>
        <FontAwesome
          name="user"
=======
  const [error, setError] = useState<string | null>(null);
  const { signIn, session, isLoading } = useSession();

  const login = () => {
    if(username && password) {
      const res = signIn(username, password);
    } else {
      setError('Please enter username and password');
    }
  }

  // useEffect(() => {
  //   if(session) {
  // //    return router.navigate("/(admin)");
  //   }
  // }, [session]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Login',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#fff' },
      }} />

      {/* Logo */}
      <Image
        source={require('../../assets/images/logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Log into your account</Text>

      {/* User Name Input */}
      <View style={styles.inputContainer}>
        <FontAwesome
          name="envelope"
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
<<<<<<< HEAD
          placeholder="Username"
=======
          placeholder="User Name"
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoFocus={true}
        />
      </View>
<<<<<<< HEAD
=======

      {/* Password Input */}
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
      <View style={styles.inputContainer}>
        <FontAwesome
          name="lock"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <FontAwesome
            name={showPassword ? "eye" : "eye-slash"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
<<<<<<< HEAD
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </KeyboardAvoidingView>
=======

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.disabledButton]}
        onPress={() => login()}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => router.push('/(auth)/register')}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: '#ffffff',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: 150,
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  logo: {
    width: 300,
    height: 70,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
=======
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
    marginVertical: 30,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
<<<<<<< HEAD
  inputWithIcon: {
    paddingLeft: 45,
=======
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
<<<<<<< HEAD
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
=======
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  loginButtonText: {
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
<<<<<<< HEAD
}); 
=======
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  registerButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 45,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
