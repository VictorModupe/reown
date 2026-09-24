import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = ["Electronics", "Fashion", "Sports", "Books", "Home", "Other"];

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
};

export default function CreateProductScreen() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>({ name: "", description: "", price: "", stock: "", category: "Fashion" });
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const createProduct = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock || images.length === 0) {
        throw new Error("Add product details and at least one image.");
      }

      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("description", form.description.trim());
      body.append("price", form.price);
      body.append("stock", form.stock);
      body.append("category", form.category);
      images.forEach((image, index) => {
        body.append("images", {
          uri: image.uri,
          name: image.fileName || `product-${index}.jpg`,
          type: image.mimeType || "image/jpeg",
        } as unknown as Blob);
      });

      const { data } = await api.post("/admin/products", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      Alert.alert("Product published", "Your product is now visible in the shop.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => Alert.alert("Could not publish", error?.response?.data?.message || error.message),
  });

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photos permission needed", "Allow photo access to add product images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });
    if (!result.canceled) setImages(result.assets.slice(0, 3));
  };

  const setField = (key: keyof ProductForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <SafeScreen>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center px-6 pt-6 pb-5">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 rounded-full bg-surface p-3">
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-text-primary text-3xl font-bold">Add product</Text>
            <Text className="text-text-secondary mt-1">Give your next find a great first impression.</Text>
          </View>
        </View>

        <View className="mx-6 rounded-3xl bg-surface p-5">
          <TouchableOpacity onPress={pickImages} className="rounded-2xl border border-dashed border-primary/60 bg-background-lighter p-5">
            {images.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image) => <Image key={image.uri} source={{ uri: image.uri }} className="mr-3 h-24 w-24 rounded-xl" />)}
              </ScrollView>
            ) : (
              <View className="items-center py-8">
                <Ionicons name="images-outline" size={38} color="#8264A9" />
                <Text className="mt-3 font-bold text-text-primary">Add up to 3 photos</Text>
                <Text className="mt-1 text-text-secondary">Clear photos sell faster</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput className="mt-5 rounded-xl bg-background-lighter px-4 py-4 text-text-primary" placeholder="Product name" placeholderTextColor="#777" value={form.name} onChangeText={(value) => setField("name", value)} />
          <TextInput className="mt-3 min-h-28 rounded-xl bg-background-lighter px-4 py-4 text-text-primary" placeholder="Description" placeholderTextColor="#777" multiline textAlignVertical="top" value={form.description} onChangeText={(value) => setField("description", value)} />
          <View className="mt-3 flex-row gap-3">
            <TextInput className="flex-1 rounded-xl bg-background-lighter px-4 py-4 text-text-primary" placeholder="Price" placeholderTextColor="#777" keyboardType="decimal-pad" value={form.price} onChangeText={(value) => setField("price", value)} />
            <TextInput className="flex-1 rounded-xl bg-background-lighter px-4 py-4 text-text-primary" placeholder="Stock" placeholderTextColor="#777" keyboardType="number-pad" value={form.stock} onChangeText={(value) => setField("stock", value)} />
          </View>

          <Text className="mt-5 mb-3 font-bold text-text-primary">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((category) => <TouchableOpacity key={category} onPress={() => setField("category", category)} className={`rounded-full px-4 py-2 ${form.category === category ? "bg-primary" : "bg-background-lighter"}`}><Text className={form.category === category ? "font-bold text-background" : "text-text-secondary"}>{category}</Text></TouchableOpacity>)}
          </View>

          <TouchableOpacity onPress={() => createProduct.mutate()} disabled={createProduct.isPending} className="mt-7 rounded-2xl bg-primary py-4">
            {createProduct.isPending ? <ActivityIndicator color="#121212" /> : <Text className="text-center text-lg font-bold text-background">Publish product</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
