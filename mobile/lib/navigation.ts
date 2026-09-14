export type UserRole = "customer" | "vendor" | "admin";

export const getDashboardRoute = (role?: UserRole | string | null) => {
  switch (role) {
    case "vendor":
      return "/(vendor)";
    case "admin":
      return "/(admin)"; // adjust to your actual admin route group
    case "customer":
    default:
      return "/(tabs)";
  }
};