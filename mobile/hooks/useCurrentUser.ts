import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { User } from "@/types";

export default function useCurrentUser() {
  const api = useApi();

  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/users/me");
      return data.user;
    },
  });
}