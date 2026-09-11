import SafeScreen from "@/components/SafeScreen";
import { useCustomerOffers } from "@/hooks/useOffers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function OffersScreen() {
  const { data: offers = [], isLoading } = useCustomerOffers();

  return (
    <SafeScreen>
      <View className="flex-1 px-6 pt-6">
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4"><Ionicons name="arrow-back" size={24} color="#FFFFFF" /></TouchableOpacity>
          <Text className="text-text-primary text-3xl font-bold">My offers</Text>
        </View>
        {isLoading ? <ActivityIndicator size="large" color="#1DB954" /> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {offers.length === 0 ? <Text className="text-text-secondary text-center mt-12">Your submitted offers will appear here.</Text> : offers.map((offer) => (
            <View key={offer._id} className="mb-3 rounded-2xl bg-surface p-4">
              <View className="flex-row justify-between"><Text className="text-text-primary flex-1 font-bold">{offer.product.name}</Text><Text className={`font-bold capitalize ${offer.status === "accepted" ? "text-green-500" : offer.status === "rejected" ? "text-red-500" : "text-orange-500"}`}>{offer.status}</Text></View>
              <Text className="text-text-secondary mt-2">Your offer: ${offer.offeredPrice.toFixed(2)} x {offer.quantity}</Text>
              <Text className="text-text-secondary mt-1">Seller: {typeof offer.vendor === "string" ? "Seller" : offer.vendor.name}</Text>
              {offer.message ? <Text className="text-text-secondary mt-2">“{offer.message}”</Text> : null}
            </View>
          ))}
        </ScrollView>}
      </View>
    </SafeScreen>
  );
}
