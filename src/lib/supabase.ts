import { supabase } from "../integrations/supabase/client";
import {
  Customer,
  Employee,
  Product,
  Order,
  OrderItem,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
  OrderStatus,
} from "./types";
import { Json } from "../integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";

// Helper function to validate UUID
export const isValidUUID = (uuid: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Helper function to ensure UUID format
const ensureUUID = (id: string) => {
  if (isValidUUID(id)) return id;
  try {
    // Try to convert the id to a UUID format
    return uuidv4();
  } catch (error) {
    console.error("Error converting ID to UUID:", error);
    return uuidv4(); // Return a new UUID as fallback
  }
};

// Customer functions
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase.from("customers").select("*");

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in fetchCustomers:", error);
    return [];
  }
};

export const fetchCustomerById = async (
  customerId: string | number
): Promise<Customer | null> => {
  try {
    if (!customerId) {
      console.error("Invalid customer ID:", customerId);
      return null;
    }

    const numericId = Number(customerId);
    if (isNaN(numericId)) {
      console.error("Invalid customer ID:", customerId);
      return null;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error) {
      console.error("Error fetching customer:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchCustomerById:", error);
    return null;
  }
};

export const createCustomer = async (
  customer: Omit<Customer, "id" | "created_at">
): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createCustomer:", error);
    return null;
  }
};

export const updateCustomer = async (
  id: string | number,
  customer: Partial<Omit<Customer, "id" | "created_at">>
): Promise<Customer | null> => {
  try {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.error("Invalid customer ID:", id);
      return null;
    }

    const { data, error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    return null;
  }
};

export const deleteCustomer = async (id: string | number): Promise<boolean> => {
  try {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.error("Invalid customer ID:", id);
      return false;
    }

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", numericId);

    if (error) {
      console.error("Error deleting customer:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCustomer:", error);
    return false;
  }
};

// Employee functions
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase.from("employees").select("*");

    if (error) {
      console.error("Error fetching employees:", error);
      return [];
    }

    return data.map((employee) => ({
      ...employee,
      id: employee.id.toString(),
    }));
  } catch (error) {
    console.error("Error in fetchEmployees:", error);
    return [];
  }
};

export const fetchEmployeeById = async (
  employeeId: string
): Promise<Employee | null> => {
  try {
    if (!employeeId) {
      console.error("Invalid employee ID:", employeeId);
      return null;
    }

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (error) {
      console.error("Error fetching employee:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchEmployeeById:", error);
    return null;
  }
};

export const createEmployee = async (
  employee: Omit<Employee, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: Employee; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .insert([employee])
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        ...data,
        id: data.id.toString(),
      } as Employee,
    };
  } catch (err) {
    console.error("Error in createEmployee:", err);
    return { success: false, error: "Internal server error" };
  }
};

export const updateEmployee = async (
  id: string,
  employee: Partial<Omit<Employee, "id" | "created_at" | "updated_at">>
): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .update(employee)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating employee:", error);
      return null;
    }

    return data as Employee;
  } catch (err) {
    console.error("Error in updateEmployee:", err);
    return null;
  }
};

export const deleteEmployee = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) {
      console.error("Error deleting employee:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteEmployee:", err);
    return { success: false, error: "Internal server error" };
  }
};

// Employee profile image functions
export const uploadEmployeeImage = async (
  employeeId: string,
  file: File
): Promise<string> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${employeeId}-${Math.random()}.${fileExt}`;
    const filePath = `employee-profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("employee-profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("employee-profiles").getPublicUrl(filePath);

    // Update employee record with new image URL
    const { error: updateError } = await supabase
      .from("employees")
      .update({ image_url: publicUrl })
      .eq("id", employeeId);

    if (updateError) {
      console.error("Error updating employee with image URL:", updateError);
      // Try to delete the uploaded file since we couldn't update the employee
      await supabase.storage.from("employee-profiles").remove([filePath]);
      throw updateError;
    }

    return publicUrl;
  } catch (err) {
    console.error("Error in uploadEmployeeImage:", err);
    throw err;
  }
};

export const deleteEmployeeImage = async (
  employeeId: string
): Promise<boolean> => {
  try {
    // Get the current employee to find the image path
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("image_url")
      .eq("id", employeeId)
      .single();

    if (fetchError || !employee?.image_url) {
      return false;
    }

    // Extract filename from URL
    const urlParts = employee.image_url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    if (!fileName) return false;

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from("employee-profiles")
      .remove([`employee-profiles/${fileName}`]);

    if (deleteError) {
      console.error("Error deleting employee image:", deleteError);
      return false;
    }

    // Update employee record to remove image URL
    const { error: updateError } = await supabase
      .from("employees")
      .update({ image_url: null })
      .eq("id", employeeId);

    if (updateError) {
      console.error("Error updating employee record:", updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteEmployeeImage:", err);
    return false;
  }
};

// Product functions
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase.from("products").select(`
        *,
        iphone_details (*),
        charger_details (*),
        cable_details (*),
        airpod_details (*)
      `);

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data.map((product) => {
      const baseProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        category: product.category,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };

      switch (product.category) {
        case "iPhone":
          return {
            ...baseProduct,
            category: "iPhone",
            iphone_details: product.iphone_details?.[0] || null,
          } as iPhoneProduct;
        case "Charger":
          return {
            ...baseProduct,
            category: "Charger",
            charger_details: product.charger_details?.[0] || null,
          } as ChargerProduct;
        case "Cable":
          return {
            ...baseProduct,
            category: "Cable",
            cable_details: product.cable_details?.[0] || null,
          } as CableProduct;
        case "AirPod":
          return {
            ...baseProduct,
            category: "AirPod",
            airpod_details: product.airpod_details?.[0] || null,
          } as AirPodProduct;
        default:
          return baseProduct as Product;
      }
    });
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        iphone_details (*),
        charger_details (*),
        cable_details (*),
        airpod_details (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    const baseProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      category: product.category,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    switch (product.category) {
      case "iPhone":
        return {
          ...baseProduct,
          category: "iPhone",
          iphone_details: product.iphone_details?.[0]
            ? {
                id: product.iphone_details[0].id.toString(),
                product_id: product.iphone_details[0].product_id.toString(),
                color: product.iphone_details[0].color,
                storage: product.iphone_details[0].storage,
              }
            : null,
        } as iPhoneProduct;
      case "Charger":
        return {
          ...baseProduct,
          category: "Charger",
          charger_details: product.charger_details?.[0]
            ? {
                id: product.charger_details[0].id.toString(),
                product_id: product.charger_details[0].product_id.toString(),
                wattage: product.charger_details[0].wattage,
                is_fast_charging: product.charger_details[0].is_fast_charging,
              }
            : null,
        } as ChargerProduct;
      case "Cable":
        return {
          ...baseProduct,
          category: "Cable",
          cable_details: product.cable_details?.[0]
            ? {
                id: product.cable_details[0].id.toString(),
                product_id: product.cable_details[0].product_id.toString(),
                type: product.cable_details[0].type,
                length: product.cable_details[0].length,
              }
            : null,
        } as CableProduct;
      case "AirPod":
        return {
          ...baseProduct,
          category: "AirPod",
          airpod_details: product.airpod_details?.[0]
            ? {
                id: product.airpod_details[0].id.toString(),
                product_id: product.airpod_details[0].product_id.toString(),
              }
            : null,
        } as AirPodProduct;
      default:
        return baseProduct as Product;
    }
  } catch (error) {
    console.error("Error in fetchProductById:", error);
    return null;
  }
};

export const createProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product | null> => {
  try {
    // First create the base product
    const baseData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status,
    };

    const { data: baseProduct, error: baseError } = await supabase
      .from("products")
      .insert([baseData])
      .select()
      .single();

    if (baseError) {
      console.error("Error creating base product:", baseError);
      return null;
    }

    // Then create the category-specific details
    let detailsError = null;
    switch (product.category) {
      case "iPhone": {
        const iPhoneProduct = product as iPhoneProduct;
        if (iPhoneProduct.iphone_details) {
          const { error } = await supabase.from("iphone_details").insert([
            {
              product_id: baseProduct.id,
              color: iPhoneProduct.iphone_details.color,
              storage: iPhoneProduct.iphone_details.storage,
            },
          ]);
          detailsError = error;
        }
        break;
      }
      case "Charger": {
        const chargerProduct = product as ChargerProduct;
        if (chargerProduct.charger_details) {
          const { error } = await supabase.from("charger_details").insert([
            {
              product_id: baseProduct.id,
              wattage: chargerProduct.charger_details.wattage,
              is_fast_charging: chargerProduct.charger_details.is_fast_charging,
            },
          ]);
          detailsError = error;
        }
        break;
      }
      case "Cable": {
        const cableProduct = product as CableProduct;
        if (cableProduct.cable_details) {
          const { error } = await supabase.from("cable_details").insert([
            {
              product_id: baseProduct.id,
              type: cableProduct.cable_details.type,
              length: cableProduct.cable_details.length,
            },
          ]);
          detailsError = error;
        }
        break;
      }
      case "AirPod": {
        const { error } = await supabase.from("airpod_details").insert([
          {
            product_id: baseProduct.id,
          },
        ]);
        detailsError = error;
        break;
      }
    }

    if (detailsError) {
      console.error("Error creating product details:", detailsError);
      // Clean up the base product if details creation failed
      await supabase.from("products").delete().eq("id", baseProduct.id);
      return null;
    }

    // Return the complete product
    return fetchProductById(baseProduct.id);
  } catch (error) {
    console.error("Error in createProduct:", error);
    return null;
  }
};

export const updateProduct = async (
  id: number,
  product: Partial<Omit<Product, "id" | "created_at" | "updated_at">>
): Promise<Product | null> => {
  try {
    // First get the current product to know its category
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("category")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching current product:", fetchError);
      return null;
    }

    // Update base product fields
    const baseData: Record<string, unknown> = {};
    if (product.name) baseData.name = product.name;
    if (product.description) baseData.description = product.description;
    if (product.price) baseData.price = product.price;
    if (product.stock) baseData.stock = product.stock;
    if (product.status) baseData.status = product.status;

    // Update base product
    const { error } = await supabase
      .from("products")
      .update(baseData)
      .eq("id", id);

    if (error) {
      console.error("Error updating product:", error);
      return null;
    }

    // Update category-specific details
    let detailsError = null;
    switch (currentProduct.category) {
      case "iPhone": {
        const iPhoneProduct = product as Partial<iPhoneProduct>;
        if (iPhoneProduct.iphone_details) {
          const { error } = await supabase
            .from("iphone_details")
            .update({
              color: iPhoneProduct.iphone_details.color,
              storage: iPhoneProduct.iphone_details.storage,
            })
            .eq("product_id", id);
          detailsError = error;
        }
        break;
      }
      case "Charger": {
        const chargerProduct = product as Partial<ChargerProduct>;
        if (chargerProduct.charger_details) {
          const { error } = await supabase
            .from("charger_details")
            .update({
              wattage: chargerProduct.charger_details.wattage,
              is_fast_charging: chargerProduct.charger_details.is_fast_charging,
            })
            .eq("product_id", id);
          detailsError = error;
        }
        break;
      }
      case "Cable": {
        const cableProduct = product as Partial<CableProduct>;
        if (cableProduct.cable_details) {
          const { error } = await supabase
            .from("cable_details")
            .update({
              type: cableProduct.cable_details.type,
              length: cableProduct.cable_details.length,
            })
            .eq("product_id", id);
          detailsError = error;
        }
        break;
      }
    }

    if (detailsError) {
      console.error("Error updating product details:", detailsError);
      return null;
    }

    // Return the updated product
    return fetchProductById(id);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return null;
  }
};

export const deleteProduct = async (id: string | number): Promise<boolean> => {
  try {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", numericId);

    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    return false;
  }
};

// Order functions
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase.from("orders").select(`
        *,
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price,
          details,
          created_at,
          product:products!order_items_product_id_fkey (
            id,
            name,
            price
          )
        )
      `);

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data.map((order) => ({
      ...order,
      status: order.status as OrderStatus,
      items: order.order_items.map((item) => ({
        ...item,
        details: item.details as Json,
      })),
    }));
  } catch (error) {
    console.error("Error in fetchOrders:", error);
    return [];
  }
};

export const fetchOrderById = async (
  orderId: number
): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          order_id,
          product_id,
          quantity,
          price,
          details,
          created_at,
          product:products!order_items_product_id_fkey (
            id,
            name,
            price
          )
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    return {
      ...data,
      status: data.status as OrderStatus,
      items: data.order_items.map((item) => ({
        ...item,
        details: item.details as Json,
      })),
    };
  } catch (error) {
    console.error("Error in fetchOrderById:", error);
    return null;
  }
};

export const createOrder = async (
  order: Omit<Order, "id" | "created_at" | "updated_at" | "items"> & {
    items: Array<Omit<OrderItem, "id" | "order_id" | "created_at">>;
  }
): Promise<Order | null> => {
  try {
    // First check stock availability for all items
    for (const item of order.items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (productError) {
        console.error("Error checking product stock:", productError);
        return null;
      }

      if (!product || product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.product_id}. Available: ${
            product?.stock || 0
          }, Requested: ${item.quantity}`
        );
      }
    }

    // Create the order
    const orderData = {
      customer_id: order.customer_id,
      employee_id: order.employee_id,
      total: order.total,
      status: order.status,
    };

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return null;
    }

    // Create order items and update product stock
    const orderItems = [];
    for (const item of order.items) {
      // Create order item
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert([
          {
            order_id: orderResult.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            details: item.details as Json,
          },
        ])
        .select()
        .single();

      if (itemError) {
        console.error("Error creating order item:", itemError);
        // Rollback order creation
        await supabase.from("orders").delete().eq("id", orderResult.id);
        return null;
      }

      orderItems.push(orderItem);

      // Update product stock
      const { error: stockError } = await supabase.functions.invoke(
        "decrease_stock",
        {
          body: {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          },
        }
      );

      if (stockError) {
        console.error("Error updating product stock:", stockError);
        // Rollback order creation
        await supabase.from("orders").delete().eq("id", orderResult.id);
        return null;
      }
    }

    return {
      ...orderResult,
      status: orderResult.status as "pending" | "completed" | "cancelled",
      items: orderItems.map((item) => ({
        ...item,
        details: item.details as Json,
      })),
    };
  } catch (error) {
    console.error("Error in createOrder:", error);
    return null;
  }
};

export const updateOrder = async (
  id: number,
  order: Partial<Omit<Order, "id" | "created_at" | "updated_at" | "items">> & {
    items?: Array<Omit<OrderItem, "id" | "order_id" | "created_at">>;
  }
): Promise<Order | null> => {
  try {
    // Update order base fields
    if (Object.keys(order).length > 0) {
      const { error: orderError } = await supabase
        .from("orders")
        .update(order)
        .eq("id", id);

      if (orderError) {
        console.error("Error updating order:", orderError);
        return null;
      }
    }

    // Update order items if provided
    if (order.items) {
      // First, get current order items
      const { data: currentItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) {
        console.error("Error fetching current order items:", itemsError);
        return null;
      }

      // Delete current items
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", id);

      if (deleteError) {
        console.error("Error deleting current order items:", deleteError);
        return null;
      }

      // Restore stock for deleted items
      for (const item of currentItems) {
        const { error: stockError } = await supabase.functions.invoke(
          "increase_stock",
          {
            body: {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            },
          }
        );

        if (stockError) {
          console.error("Error restoring product stock:", stockError);
          return null;
        }
      }

      // Create new items
      for (const item of order.items) {
        // Check stock availability
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (productError) {
          console.error("Error checking product stock:", productError);
          return null;
        }

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.product_id}. Available: ${
              product?.stock || 0
            }, Requested: ${item.quantity}`
          );
        }

        // Create order item
        const { error: itemError } = await supabase.from("order_items").insert([
          {
            order_id: id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            details: item.details as Json,
          },
        ]);

        if (itemError) {
          console.error("Error creating order item:", itemError);
          return null;
        }

        // Update product stock
        const { error: stockError } = await supabase.functions.invoke(
          "decrease_stock",
          {
            body: {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            },
          }
        );

        if (stockError) {
          console.error("Error updating product stock:", stockError);
          return null;
        }
      }
    }

    // Return updated order
    return fetchOrderById(id);
  } catch (error) {
    console.error("Error in updateOrder:", error);
    return null;
  }
};

export const deleteOrder = async (
  id: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First get the order items to restore stock
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return { success: false, error: "Error fetching order items" };
    }

    // Restore stock for all items
    for (const item of items) {
      const { error: stockError } = await supabase.functions.invoke(
        "increase_stock",
        {
          body: {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          },
        }
      );

      if (stockError) {
        console.error("Error restoring product stock:", stockError);
        return { success: false, error: "Error restoring product stock" };
      }
    }

    // Delete the order (this will cascade delete the order items)
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("Error deleting order:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    return { success: false, error: "Internal server error" };
  }
};

export const deleteAllRecords = async () => {
  try {
    // First delete all order_items (child of orders)
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .delete()
      .not("id", "is", null);

    if (orderItemsError) throw orderItemsError;

    // Then delete all orders
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .not("id", "is", null);

    if (ordersError) throw ordersError;

    // Delete product details tables first (children of products)
    const { error: iphoneDetailsError } = await supabase
      .from("iphone_details")
      .delete()
      .not("product_id", "is", null);

    if (iphoneDetailsError) throw iphoneDetailsError;

    const { error: chargerDetailsError } = await supabase
      .from("charger_details")
      .delete()
      .not("product_id", "is", null);

    if (chargerDetailsError) throw chargerDetailsError;

    const { error: cableDetailsError } = await supabase
      .from("cable_details")
      .delete()
      .not("product_id", "is", null);

    if (cableDetailsError) throw cableDetailsError;

    const { error: airpodDetailsError } = await supabase
      .from("airpod_details")
      .delete()
      .not("product_id", "is", null);

    if (airpodDetailsError) throw airpodDetailsError;

    // Then delete products
    const { error: productsError } = await supabase
      .from("products")
      .delete()
      .not("id", "is", null);

    if (productsError) throw productsError;

    // Finally delete employees and customers
    const { error: employeesError } = await supabase
      .from("employees")
      .delete()
      .not("id", "is", null);

    if (employeesError) throw employeesError;

    const { error: customersError } = await supabase
      .from("customers")
      .delete()
      .not("id", "is", null);

    if (customersError) throw customersError;

    return { success: true };
  } catch (error) {
    console.error("Error deleting records:", error);
    return { success: false, error };
  }
};

export async function getCustomerPurchaseCount(
  customerId: string | number
): Promise<number> {
  try {
    if (!customerId || isNaN(Number(customerId))) {
      console.error("Invalid customer ID:", customerId);
      return 0;
    }

    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", Number(customerId));

    if (error) {
      console.error("Error getting customer purchase count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getCustomerPurchaseCount:", error);
    return 0;
  }
}

export interface EmployeeSalesMetrics {
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
}

export const getEmployeeSalesMetrics = async (
  employeeId: string | number
): Promise<EmployeeSalesMetrics> => {
  try {
    const numericId =
      typeof employeeId === "string" ? parseInt(employeeId, 10) : employeeId;

    // Get all orders for the employee
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total")
      .eq("employee_id", numericId);

    if (error) {
      console.error("Error fetching employee orders:", error);
      return {
        totalSales: 0,
        orderCount: 0,
        averageOrderValue: 0,
      };
    }

    // Calculate metrics
    const orderCount = orders.length;
    const totalSales = orders.reduce(
      (sum, order) => sum + (parseFloat(String(order.total)) || 0),
      0
    );
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    return {
      totalSales,
      orderCount,
      averageOrderValue,
    };
  } catch (err) {
    console.error("Error in getEmployeeSalesMetrics:", err);
    return {
      totalSales: 0,
      orderCount: 0,
      averageOrderValue: 0,
    };
  }
};
