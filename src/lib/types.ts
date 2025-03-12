import { Json } from "@/integrations/supabase/types";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  status: "active" | "inactive";
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const PRODUCT_CATEGORIES = [
  "iPhone",
  "Charger",
  "Cable",
  "AirPod",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUS = ["available", "unavailable"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const IPHONE_COLORS = [
  "Black",
  "White",
  "Gold",
  "Silver",
  "Blue",
  "Purple",
  "Red",
  "Green",
  "Yellow",
  "Pink",
] as const;
export type iPhoneColor = (typeof IPHONE_COLORS)[number];

export const IPHONE_STORAGE = [
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
] as const;
export type iPhoneStorage = (typeof IPHONE_STORAGE)[number];

export const CHARGER_WATTAGE = [
  "8W",
  "10W",
  "15W",
  "18W",
  "20W",
  "25W",
  "45W",
] as const;
export type ChargerWattage = (typeof CHARGER_WATTAGE)[number];

export const CABLE_TYPES = [
  "USB-C to Lightning",
  "USB-C to USB-C",
  "USB-A to Lightning",
] as const;
export type CableType = (typeof CABLE_TYPES)[number];

export const CABLE_LENGTHS = ["1m", "2m"] as const;
export type CableLength = (typeof CABLE_LENGTHS)[number];

export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: "available" | "unavailable";
  category: "iPhone" | "Charger" | "Cable" | "AirPod";
  created_at: string;
  updated_at: string;
}

export interface iPhoneDetails {
  id: string;
  product_id: string;
  color: string;
  storage: string;
}

export interface ChargerDetails {
  id: string;
  product_id: string;
  wattage: string;
  is_fast_charging: boolean;
}

export interface CableDetails {
  id: string;
  product_id: string;
  type: string;
  length: string;
}

export interface AirPodDetails {
  id: string;
  product_id: string;
}

export interface iPhoneProduct extends BaseProduct {
  category: "iPhone";
  iphone_details: iPhoneDetails | null;
}

export interface ChargerProduct extends BaseProduct {
  category: "Charger";
  charger_details: ChargerDetails | null;
}

export interface CableProduct extends BaseProduct {
  category: "Cable";
  cable_details: CableDetails | null;
}

export interface AirPodProduct extends BaseProduct {
  category: "AirPod";
  airpod_details: AirPodDetails | null;
}

export type Product =
  | iPhoneProduct
  | ChargerProduct
  | CableProduct
  | AirPodProduct;

export const ORDER_STATUS = ["pending", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  details: Json;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  customer_id: number;
  customer_name?: string;
  employee_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
