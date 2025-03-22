import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Register',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#fff' },
      }} />
      
      {/* Logo */}
      <Image 
        source={require('../../assets/images/logo.jpg')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Create your account</Text>

      {/* First Name Input */}
      <View style={styles.inputContainer}>
        <FontAwesome 
          name="user" 
          size={20} 
          color="#666" 
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
      </View>

      {/* Last Name Input */}
      <View style={styles.inputContainer}>
        <FontAwesome 
          name="user" 
          size={20} 
          color="#666" 
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
      </View>

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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <FontAwesome 
          name="lock" 
          size={20} 
          color="#666" 
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <FontAwesome 
            name={showConfirmPassword ? "eye" : "eye-slash"} 
            size={20} 
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {/* Back to Login Button */}
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => router.back()}
      >
        <Text style={styles.loginButtonText}>Back to Login</Text>
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
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
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
});