import { useEffect, useState } from 'react';
import { Link, Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSession } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, session, isLoading } = useSession();

  const login = () => {
    if(email && password) {
      const res = signIn(email, password);
    } else {
      setError('Please enter email and password');
    }
  }

  useEffect(() => {
    if(session) {
      return router.navigate("/(admin)");
    }
  }, [session]);

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

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <FontAwesome
          name="envelope"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          placeholder="email@domain.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus={true}
        />
      </View>

      {/* Password Input */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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