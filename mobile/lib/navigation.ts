export type UserRole = "customer" | "vendor" | "admin";

export const getDashboardRoute = (role?: UserRole | string | null): "/(customer-tabs)" | "/(vendor-tabs)" => {
  switch (role) {
    case "vendor":
      return "/(vendor-tabs)";
    case "admin":
      return "/(vendor-tabs)";
    case "customer":
    default:
      return "/(customer-tabs)";
  }
};