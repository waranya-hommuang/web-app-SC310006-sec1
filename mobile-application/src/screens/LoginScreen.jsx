import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';  // <-- Import getDoc here
import { getApp } from 'firebase/app';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth(getApp());
  const db = getFirestore(getApp());
  const navigation = useNavigation();

  // Handle Login (sign in)
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef); // <-- Fetch the user document

      if (!userDoc.exists()) {
        // If user doesn't exist, create user data in Firestore
        await setDoc(userRef, {
          name: user.displayName || 'Unknown',
          email: user.email,
          photo: user.photoURL || '',
          classroom: {}
        });
        console.log('User created in Firestore');
      }

      // Navigate to the next screen (Home)
      navigation.navigate('Home');

    } catch (error) {
      setError(error.message);
    }
  };

  // Handle Sign Up (create new user)
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the new user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: 'New User',
        email: user.email,
        photo: '',
        classroom: {}
      });
      console.log('User registered in Firestore');

      // Navigate to the next screen (Home)
      navigation.navigate('Home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={handleSignUp} />
      {error && <Text>{error}</Text>}
    </View>
  );
};

export default LoginScreen;
