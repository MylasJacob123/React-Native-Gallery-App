import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);

  const loadGallery = async () => {
    try {
      const storedImages = await AsyncStorage.getItem("gallery");
      if (storedImages) {
        setGallery(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error("Failed to load images from storage", error);
    }
  };

  const saveGallery = async (images) => {
    try {
      await AsyncStorage.setItem("gallery", JSON.stringify(images));
    } catch (error) {
      console.error("Failed to save images to storage", error);
    }
  };

  useEffect(() => {
    // showToast("Error loading gallery", "error");
    loadGallery();
  }, []);

  const showToast = (message, type) => {
    Toast.show({
      type: type,
      position: "top",
      text1: message,
      visibilityTime: 3000,
    });
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showToast("Permission denied", "Camera access is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newGallery = [...gallery, result.assets[0].uri];
      setGallery(newGallery);
      saveGallery(newGallery);
    } else {
      showToast("No image", "No image was captured.");
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Permission denied", "Media library access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newGallery = [...gallery, result.assets[0].uri];
      setGallery(newGallery);
      saveGallery(newGallery);
    } else {
      showToast("No image", "No image was selected.");
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item }} style={styles.image} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Gallery</Text>
      {gallery.length > 0 ? (
        <FlatList
          data={gallery}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.gallery}
        />
      ) : (
        <Text style={styles.emptyText}>No images in the gallery.</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <FontAwesome name="camera" size={14} color="#fff" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUploadPhoto}>
          <FontAwesome name="upload" size={14} color="#fff" />
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 24,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    color: "#132946",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    gap: 10,
    backgroundColor: "#132946",
    width: "100%",
    height: 50,
    borderRadius: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132946",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
    fontWeight: "400",
  },
  gallery: {
    paddingBottom: 16,
  },
  imageWrapper: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
});
