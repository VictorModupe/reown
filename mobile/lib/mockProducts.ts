import { Product } from "@/types";

export const USE_MOCK_PRODUCTS = true; // flip to false once your API is reachable

export const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Wireless Headphones",
    price: 79.99,
    images: [
      "https://picsum.photos/seed/headphones1/800/800",
      "https://picsum.photos/seed/headphones2/800/800",
    ],
    description:
      "Comfortable over-ear headphones with active noise cancellation and 30-hour battery life.",
    category: "Electronics",
    stock: 12,
    averageRating: 4.5,
    totalReviews: 128,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    name: "Leather Wallet",
    price: 34.5,
    images: ["https://picsum.photos/seed/wallet1/800/800"],
    description: "Slim genuine leather wallet with 6 card slots and a coin pocket.",
    category: "Accessories",
    stock: 0,
    averageRating: 4.1,
    totalReviews: 42,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    _id: "3",
    name: "Running Shoes",
    price: 89.0,
    images: [
      "https://picsum.photos/seed/shoes1/800/800",
      "https://picsum.photos/seed/shoes2/800/800",
      "https://picsum.photos/seed/shoes3/800/800",
    ],
    description: "Lightweight running shoes with breathable mesh upper and cushioned sole.",
    category: "Footwear",
    stock: 5,
    averageRating: 4.8,
    totalReviews: 301,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
];