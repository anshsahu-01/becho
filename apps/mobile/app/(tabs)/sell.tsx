import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { CartButton } from "@/components/CartButton";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/hooks/useAuth";
import * as categoryService from "@/services/category.service";
import * as productService from "@/services/product.service";
import { ApiError } from "@/services/api";
import { Category } from "@/types";

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function SellScreen() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Good");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
      mediaTypes: ["images"],
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!title.trim() || !description.trim() || !price || !categoryId) {
      setError("Fill all required fields");
      return;
    }
    if (images.length === 0) {
      setError("Add at least one photo");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await productService.createProduct(
        {
          title: title.trim(),
          description: description.trim(),
          price,
          condition,
          categoryId,
          imageUris: images,
        },
        token
      );
      Alert.alert("Listed", "Your item is now live.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to list item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Sell an item" rightAction={<CartButton count={Math.min(images.length, 3)} />} />

      <ScrollView
        contentContainerClassName="p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="rounded-2xl border border-line bg-white p-4">
          <Text className="mb-2 mt-2 text-[13px] font-medium text-muted">
            Photos ({images.length}/5)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <Pressable
              className="mr-2 h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line bg-white"
              onPress={pickImages}
            >
              <Text className="text-[13px] text-muted">+ Add</Text>
            </Pressable>
            {images.map((uri, index) => (
              <Pressable key={uri} onPress={() => removeImage(index)}>
                <Image source={{ uri }} className="mr-2 h-20 w-20 rounded-xl" />
              </Pressable>
            ))}
          </ScrollView>

          <Input label="Title" value={title} onChangeText={setTitle} placeholder="What are you selling?" />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe condition, usage, etc."
            multiline
            inputClassName="h-[88px] pt-3"
          />
          <Input
            label="Price (Rs)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
          />

          <Text className="mb-2 mt-2 text-[13px] font-medium text-muted">Category</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                active={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
          </View>

          <Text className="mb-2 text-[13px] font-medium text-muted">Condition</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {CONDITIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                active={condition === item}
                onPress={() => setCondition(item)}
              />
            ))}
          </View>

          {error ? <Text className="mb-3 text-[13px] text-danger">{error}</Text> : null}
          <Button title="Post listing" onPress={handleSubmit} loading={loading} className="rounded-2xl" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
