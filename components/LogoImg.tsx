import React, { useState } from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';

export default function LogoImg() {
  return (
    <Image source={require('../assets/images/logo.png')} style={styles.logo} />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 250,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 20,
  },
});

