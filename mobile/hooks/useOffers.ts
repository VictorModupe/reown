import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Offer } from "@/types";

export const useCustomerOffers = () => {
  const api = useApi();
  return useQuery<Offer[]>({
    queryKey: ["offers"],
    queryFn: async () => (await api.get<{ offers: Offer[] }>("/offers")).data.offers,
  });
};

export const useCreateOffer = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; offeredPrice: number; quantity: number; message?: string }) =>
      (await api.post<{ offer: Offer }>("/offers", payload)).data.offer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers"] }),
  });
};

export const useVendorOffers = () => {
  const api = useApi();
  return useQuery<Offer[]>({
    queryKey: ["vendor-offers"],
    queryFn: async () => (await api.get<{ offers: Offer[] }>("/offers/vendor")).data.offers,
  });
};

export const useUpdateOfferStatus = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: "accepted" | "rejected" }) =>
      (await api.patch<{ offer: Offer }>(`/offers/${offerId}`, { status })).data.offer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};
