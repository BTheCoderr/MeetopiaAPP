import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';

const ProfileScreen = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </SafeAreaView>
  );
};

export default ProfileScreen; 