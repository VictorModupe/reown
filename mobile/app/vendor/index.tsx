import SafeScreen from "@/components/SafeScreen";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useApi } from "@/lib/api";
import { Offer, Order, Product } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type ProductForm = { name: string; description: string; price: string; stock: string; category: string };
const initialForm: ProductForm = { name: "", description: "", price: "", stock: "", category: "" };

export default function VendorScreen() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const canManage = user?.role === "vendor" || user?.role === "admin";
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const { data: products = [], isLoading: productsLoading } = useQuery({ queryKey: ["vendor-products"], enabled: canManage, queryFn: async () => (await api.get<Product[]>("/admin/products")).data });
  const { data: orders = [] } = useQuery({ queryKey: ["vendor-orders"], enabled: canManage, queryFn: async () => (await api.get<{ orders: Order[] }>("/admin/orders")).data.orders });
  const { data: offers = [], isLoading: offersLoading } = useQuery({ queryKey: ["vendor-offers"], enabled: canManage, queryFn: async () => (await api.get<{ offers: Offer[] }>("/admin/offers")).data.offers });
  const statusMutation = useMutation({ mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => api.patch(`/admin/orders/${orderId}/status`, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor-orders"] }) });
  const offerMutation = useMutation({ mutationFn: async ({ offerId, status }: { offerId: string; status: "accepted" | "rejected" }) => api.patch(`/admin/offers/${offerId}`, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor-offers"] }) });
  const productMutation = useMutation({
    mutationFn: async () => {
      if (!image) throw new Error("Please choose a product image");
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("description", form.description.trim());
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category.trim());
      data.append("images", { uri: image.uri, name: image.fileName || "product.jpg", type: image.mimeType || "image/jpeg" } as unknown as Blob);
      return api.post<Product>("/admin/products", data, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendor-products"] }); queryClient.invalidateQueries({ queryKey: ["products"] }); setForm(initialForm); setImage(null); setShowProductForm(false); },
    onError: (error: any) => Alert.alert("Unable to add product", error?.response?.data?.message || error.message),
  });
  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission required", "Allow photo access to add a product image."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };
  if (userLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><Text className="text-text-secondary">Loading vendor workspace...</Text></View></SafeScreen>;
  if (!canManage) return <SafeScreen><View className="flex-1 items-center justify-center px-6"><Text className="text-text-primary text-xl font-bold">Vendor access required</Text><Text className="text-text-secondary mt-2 text-center">Ask an administrator to enable vendor access for your account.</Text><TouchableOpacity className="mt-6 rounded-full bg-primary px-6 py-3" onPress={() => router.back()}><Text className="font-bold text-background">Go back</Text></TouchableOpacity></View></SafeScreen>;
  const pendingCount = offers.filter((offer) => offer.status === "pending").length;
  return <SafeScreen><View className="flex-1"><ScrollView className="px-6 pt-6" contentContainerStyle={{ paddingBottom: 110 }}><Text className="text-text-primary text-3xl font-bold">Vendor workspace</Text><Text className="text-text-secondary mt-1">Manage your catalog, offers, and fulfillment</Text><View className="mt-6 flex-row gap-3"><View className="flex-1 rounded-2xl bg-surface p-5"><Text className="text-text-secondary">Products</Text><Text className="text-text-primary mt-1 text-3xl font-bold">{productsLoading ? "..." : products.length}</Text></View><View className="flex-1 rounded-2xl bg-surface p-5"><Text className="text-text-secondary">Orders</Text><Text className="text-text-primary mt-1 text-3xl font-bold">{orders.length}</Text></View></View><Text className="text-text-primary mb-3 mt-6 text-lg font-bold">Price offers {pendingCount ? `(${pendingCount} new)` : ""}</Text>{offersLoading ? <ActivityIndicator color="#1DB954" /> : offers.length === 0 ? <Text className="text-text-secondary">Customer offers will appear here.</Text> : offers.map((offer) => <OfferCard key={offer._id} offer={offer} pending={offerMutation.isPending} onRespond={(status) => offerMutation.mutate({ offerId: offer._id, status })} />)}<Text className="text-text-primary mb-3 mt-6 text-lg font-bold">Catalog</Text>{products.length === 0 && !productsLoading ? <Text className="text-text-secondary">No available Products</Text> : products.map((product) => <View key={product._id} className="mb-3 rounded-2xl bg-surface p-4"><View className="flex-row justify-between"><Text className="text-text-primary flex-1 font-bold">{product.name}</Text><Text className="text-primary font-bold">${product.price.toFixed(2)}</Text></View><Text className="text-text-secondary mt-2 text-sm">{product.stock} in stock</Text></View>)}<Text className="text-text-primary mb-3 mt-5 text-lg font-bold">Orders</Text>{orders.map((order) => <View key={order._id} className="mb-3 rounded-2xl bg-surface p-4"><View className="flex-row justify-between"><Text className="text-text-primary font-bold">#{order._id.slice(-8).toUpperCase()}</Text><Text className="text-text-secondary">${order.totalPrice.toFixed(2)}</Text></View><Text className="text-text-secondary mt-2 text-sm">{order.orderItems.length} item(s)</Text><TouchableOpacity className="mt-3 self-start rounded-full bg-primary px-4 py-2" onPress={() => statusMutation.mutate({ orderId: order._id, status: order.status === "pending" ? "shipped" : "delivered" })} disabled={statusMutation.isPending || order.status === "delivered"}><Text className="font-bold text-background">{order.status === "pending" ? "Mark shipped" : order.status === "shipped" ? "Mark delivered" : "Delivered"}</Text></TouchableOpacity></View>)}</ScrollView><TouchableOpacity className="absolute bottom-6 right-6 rounded-full bg-primary px-6 py-4 shadow-lg" onPress={() => setShowProductForm(true)}><Text className="font-bold text-background">+ Add product</Text></TouchableOpacity></View><ProductFormModal visible={showProductForm} form={form} image={image} pending={productMutation.isPending} onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))} onChooseImage={chooseImage} onSubmit={() => productMutation.mutate()} onClose={() => setShowProductForm(false)} /></SafeScreen>;
}

function ProductFormModal({ visible, form, image, pending, onChange, onChooseImage, onSubmit, onClose }: { visible: boolean; form: ProductForm; image: ImagePicker.ImagePickerAsset | null; pending: boolean; onChange: (field: keyof ProductForm, value: string) => void; onChooseImage: () => void; onSubmit: () => void; onClose: () => void }) {
  const fields: [keyof ProductForm, string][] = [["name", "Product name"], ["description", "Description"], ["price", "Price"], ["stock", "Stock"], ["category", "Category"]];
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><View className="flex-1 justify-end bg-black/50"><View className="rounded-t-3xl bg-background px-6 pb-8 pt-6"><View className="mb-4 flex-row items-center justify-between"><Text className="text-text-primary text-2xl font-bold">Add product</Text><TouchableOpacity onPress={onClose}><Text className="text-text-secondary text-lg">Cancel</Text></TouchableOpacity></View>{fields.map(([field, placeholder]) => <TextInput key={field} className="mb-3 rounded-xl bg-surface px-4 py-3 text-text-primary" placeholder={placeholder} placeholderTextColor="#888" value={form[field]} onChangeText={(value) => onChange(field, value)} keyboardType={field === "price" || field === "stock" ? "numeric" : "default"} multiline={field === "description"} />)}<TouchableOpacity className="mb-4 rounded-xl border border-primary px-4 py-3" onPress={onChooseImage}>{image ? <View className="flex-row items-center"><Image source={{ uri: image.uri }} className="mr-3 h-12 w-12 rounded-lg" /><Text className="text-text-primary">Change image</Text></View> : <Text className="text-center font-bold text-primary">Choose product image</Text>}</TouchableOpacity><TouchableOpacity className="rounded-xl bg-primary py-4" onPress={onSubmit} disabled={pending}><Text className="text-center font-bold text-background">{pending ? "Adding..." : "Add product"}</Text></TouchableOpacity></View></View></Modal>;
}

function OfferCard({ offer, pending, onRespond }: { offer: Offer; pending: boolean; onRespond: (status: "accepted" | "rejected") => void }) {
  const customerName = typeof offer.customer === "string" ? "Customer" : offer.customer.name;
  return <View className="mb-3 rounded-2xl border border-primary/30 bg-surface p-4"><View className="flex-row justify-between"><Text className="text-text-primary flex-1 font-bold">{offer.product.name}</Text><Text className="font-bold capitalize text-orange-500">{offer.status}</Text></View><Text className="text-text-secondary mt-2">{customerName} offered ${offer.offeredPrice.toFixed(2)} x {offer.quantity}</Text>{offer.message ? <Text className="text-text-secondary mt-2">&quot;{offer.message}&quot;</Text> : null}{offer.status === "pending" ? <View className="mt-3 flex-row gap-2"><TouchableOpacity className="flex-1 rounded-xl bg-primary py-3" onPress={() => onRespond("accepted")} disabled={pending}><Text className="text-center font-bold text-background">Accept</Text></TouchableOpacity><TouchableOpacity className="flex-1 rounded-xl border border-red-500 py-3" onPress={() => onRespond("rejected")} disabled={pending}><Text className="text-center font-bold text-red-500">Reject</Text></TouchableOpacity></View> : null}</View>;
}
