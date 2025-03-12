import { createClient } from "@supabase/supabase-js";
import {
  Customer,
  Employee,
  Product,
  Order,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
} from "./types";
import { v4 as uuidv4 } from "uuid";

// Get Supabase URL and anon key from environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://khtkcvecjfjzmoormqjp.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodGtjdmVjamZqem1vb3JtcWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjk5ODUsImV4cCI6MjA1Njg0NTk4NX0.n-GfbUikJ0QkxHrgW1SyGA-vV1k8xrvq4m4SRZ4H970";

// Create Supabase client as a singleton
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (typeof window !== "undefined" && !supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "app-supabase-auth",
      },
    });
  }
  return supabaseInstance;
})();

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty customers array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }

    return data.map((customer) => ({
      ...customer,
      id: ensureUUID(customer.id),
      createdAt: customer.created_at
        ? new Date(new Date(customer.created_at).toUTCString())
        : new Date(),
    })) as Customer[];
  } catch (err) {
    console.error("Error in fetchCustomers:", err);
    return [];
  }
};

export const fetchCustomerById = async (
  id: string
): Promise<Customer | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null customer");
    return null;
  }

  if (!id) {
    console.error("Customer ID is required");
    return null;
  }

  // Validate UUID format
  if (!isValidUUID(id)) {
    console.error("Invalid UUID format for customer ID:", id);
    return null;
  }

  try {
    // First check if the customer exists
    const { count, error: countError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("id", id);

    if (countError) {
      console.error("Error checking customer existence:", countError);
      return null;
    }

    if (!count) {
      console.error("No customer found with ID:", id);
      return null;
    }

    // Then fetch the customer data
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, address, created_at")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching customer:", error);
      return null;
    }

    if (!data) {
      console.error("No customer data found with ID:", id);
      return null;
    }

    // Convert snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdAt: data.created_at
        ? new Date(new Date(data.created_at).toUTCString())
        : new Date(),
    } as Customer;
  } catch (err) {
    console.error("Error in fetchCustomerById:", err);
    return null;
  }
};

export const createCustomer = async (
  customer: Omit<Customer, "id" | "createdAt">
): Promise<Customer | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create customer");
    return null;
  }

  try {
    const newId = uuidv4();
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          id: newId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          created_at: utcDate.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return null;
    }

    return {
      ...data,
      id: newId,
      createdAt: data.created_at
        ? new Date(new Date(data.created_at).toUTCString())
        : utcDate,
    } as Customer;
  } catch (err) {
    console.error("Error in createCustomer:", err);
    return null;
  }
};

export const updateCustomer = async (
  id: string,
  customer: Partial<Customer>
): Promise<Customer | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update customer");
    return null;
  }

  try {
    const uuid = ensureUUID(id);
    const { data, error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return null;
    }

    return {
      ...data,
      id: uuid,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    } as Customer;
  } catch (err) {
    console.error("Error in updateCustomer:", err);
    return null;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase not configured, returning false for delete customer"
    );
    return false;
  }

  try {
    const uuid = ensureUUID(id);
    const { error } = await supabase.from("customers").delete().eq("id", uuid);

    if (error) {
      console.error("Error deleting customer:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteCustomer:", err);
    return false;
  }
};

// Employee functions
export const fetchEmployees = async (): Promise<Employee[]> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty employees array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching employees:", error);
      return [];
    }

    return data.map((employee) => ({
      ...employee,
      id: ensureUUID(employee.id),
      hireDate: employee.hire_date
        ? new Date(new Date(employee.hire_date).toUTCString())
        : new Date(),
    })) as Employee[];
  } catch (err) {
    console.error("Error in fetchEmployees:", err);
    return [];
  }
};

export const fetchEmployeeById = async (
  id: string
): Promise<Employee | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null employee");
    return null;
  }

  if (!id) {
    console.error("Employee ID is required");
    return null;
  }

  try {
    const uuid = ensureUUID(id);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", uuid)
      .single();

    if (error) {
      console.error("Error fetching employee:", error);
      return null;
    }

    return {
      ...data,
      id: uuid,
      hireDate: data.hire_date
        ? new Date(new Date(data.hire_date).toUTCString())
        : new Date(),
    } as Employee;
  } catch (err) {
    console.error("Error in fetchEmployeeById:", err);
    return null;
  }
};

export const createEmployee = async (
  employee: Omit<Employee, "id" | "hireDate">
): Promise<{ success: boolean; data?: Employee; error?: string }> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create employee");
    return { success: false, error: "Database not configured" };
  }

  try {
    const newId = uuidv4();
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );

    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          id: newId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          address: employee.address,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
          hire_date: utcDate.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      if (error.code === "23505") {
        // Unique constraint violation (duplicate email)
        return {
          success: false,
          error: `An employee with the email "${employee.email}" already exists. Please use a different email address.`,
        };
      }
      return { success: false, error: "Failed to create employee" };
    }

    return {
      success: true,
      data: {
        ...data,
        id: newId,
        hireDate: data.hire_date
          ? new Date(new Date(data.hire_date).toUTCString())
          : utcDate,
      } as Employee,
    };
  } catch (err) {
    console.error("Error in createEmployee:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const updateEmployee = async (
  id: string,
  employee: Partial<Employee>
): Promise<Employee | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update employee");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // Convert camelCase to snake_case and ensure UTC dates
    let updateData: any = { ...employee };
    if (employee.hireDate) {
      const date = new Date(employee.hireDate);
      updateData.hire_date = new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds()
        )
      ).toISOString();
      delete updateData.hireDate; // Remove the camelCase version
    }

    const { data, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating employee:", error);
      return null;
    }

    return {
      ...data,
      id: uuid,
      hireDate: data.hire_date
        ? new Date(new Date(data.hire_date).toUTCString())
        : new Date(),
    } as Employee;
  } catch (err) {
    console.error("Error in updateEmployee:", err);
    return null;
  }
};

export const deleteEmployee = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase not configured, returning false for delete employee"
    );
    return { success: false, error: "Database not configured" };
  }

  try {
    const uuid = ensureUUID(id);

    // First check if employee has any associated orders
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", uuid);

    if (countError) {
      console.error("Error checking employee orders:", countError);
      return { success: false, error: "Failed to check employee orders" };
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete employee: ${count} orders are associated with this employee. Please reassign or delete the orders first.`,
      };
    }

    const { error } = await supabase.from("employees").delete().eq("id", uuid);

    if (error) {
      console.error("Error deleting employee:", error);
      if (error.code === "23503") {
        // Foreign key violation
        return {
          success: false,
          error:
            "Cannot delete employee: There are orders or other records associated with this employee",
        };
      }
      return { success: false, error: "Failed to delete employee" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteEmployee:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Employee profile image functions
export const uploadEmployeeImage = async (
  employeeId: string,
  file: File
): Promise<string | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for image upload");
    return null;
  }

  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file to Supabase storage with public access
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("employee-profiles")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning false for image deletion");
    return false;
  }

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
      console.error("Error deleting image:", deleteError);
      return false;
    }

    // Update employee record to remove image URL
    const { error: updateError } = await supabase
      .from("employees")
      .update({ image_url: null })
      .eq("id", employeeId);

    if (updateError) {
      console.error(
        "Error updating employee after image deletion:",
        updateError
      );
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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty products array");
    return [];
  }

  try {
    const { data, error } = await supabase
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
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data.map((product) => {
      const baseProductData = {
        id: ensureUUID(product.id),
        name: product.name,
        description: product.description,
        price: parseFloat(String(product.price)) || 0,
        stock: parseInt(String(product.stock)) || 0,
        status: product.status || "available",
        category: product.category,
        createdAt: product.created_at
          ? new Date(product.created_at)
          : new Date(),
      };

      switch (product.category) {
        case "iPhone":
          return product.iphone_details
            ? ({
                ...baseProductData,
                category: "iPhone",
                color: product.iphone_details.color,
                storage: product.iphone_details.storage,
              } as iPhoneProduct)
            : baseProductData;
        case "Charger":
          return product.charger_details
            ? ({
                ...baseProductData,
                category: "Charger",
                wattage: product.charger_details.wattage,
                isFastCharging: product.charger_details.is_fast_charging,
              } as ChargerProduct)
            : baseProductData;
        case "Cable":
          return product.cable_details
            ? ({
                ...baseProductData,
                category: "Cable",
                type: product.cable_details.type,
                length: product.cable_details.length,
              } as CableProduct)
            : baseProductData;
        case "AirPod":
          return {
            ...baseProductData,
            category: "AirPod",
          } as AirPodProduct;
        default:
          return baseProductData;
      }
    });
  } catch (err) {
    console.error("Error in fetchProducts:", err);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null product");
    return null;
  }

  if (!id) {
    console.error("Product ID is required");
    return null;
  }

  try {
    const uuid = ensureUUID(id);
    const { data: completeProduct, error } = await supabase
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
      .eq("id", uuid)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    // Convert to the appropriate product type
    const baseProductData = {
      id: ensureUUID(completeProduct.id),
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(String(completeProduct.price)) || 0,
      stock: parseInt(String(completeProduct.stock)) || 0,
      status: completeProduct.status || "available",
      category: completeProduct.category,
      createdAt: completeProduct.created_at
        ? new Date(completeProduct.created_at)
        : new Date(),
    };

    switch (completeProduct.category) {
      case "iPhone":
        return completeProduct.iphone_details
          ? ({
              ...baseProductData,
              category: "iPhone",
              color: completeProduct.iphone_details.color,
              storage: completeProduct.iphone_details.storage,
            } as iPhoneProduct)
          : null;
      case "Charger":
        return completeProduct.charger_details
          ? ({
              ...baseProductData,
              category: "Charger",
              wattage: completeProduct.charger_details.wattage,
              isFastCharging: completeProduct.charger_details.is_fast_charging,
            } as ChargerProduct)
          : null;
      case "Cable":
        return completeProduct.cable_details
          ? ({
              ...baseProductData,
              category: "Cable",
              type: completeProduct.cable_details.type,
              length: completeProduct.cable_details.length,
            } as CableProduct)
          : null;
      case "AirPod":
        return {
          ...baseProductData,
          category: "AirPod",
        } as AirPodProduct;
      default:
        return null;
    }
  } catch (err) {
    console.error("Error in fetchProductById:", err);
    return null;
  }
};

export const createProduct = async (
  product: Omit<Product, "id" | "createdAt">
): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create product");
    return null;
  }

  try {
    const newId = uuidv4();

    // Base product data
    const baseData = {
      id: newId,
      name: product.name,
      description: product.description,
      price: parseFloat(String(product.price)) || 0,
      stock: parseInt(String(product.stock)) || 0,
      status: product.status || "available",
      category: product.category,
      created_at: new Date().toISOString(),
    };

    // First create the base product
    const { data: baseProduct, error: baseError } = await supabase
      .from("products")
      .insert([baseData])
      .select()
      .single();

    if (baseError) {
      console.error("Error creating base product:", baseError);
      return null;
    }

    // Then add category-specific details
    let detailsError = null;
    switch (product.category) {
      case "iPhone": {
        const iPhoneProduct = product as Omit<
          iPhoneProduct,
          "id" | "createdAt"
        >;
        const { error } = await supabase.from("iphone_details").insert([
          {
            product_id: newId,
            color: iPhoneProduct.color,
            storage: iPhoneProduct.storage,
          },
        ]);
        detailsError = error;
        break;
      }
      case "Charger": {
        const chargerProduct = product as Omit<
          ChargerProduct,
          "id" | "createdAt"
        >;
        const { error } = await supabase.from("charger_details").insert([
          {
            product_id: newId,
            wattage: chargerProduct.wattage,
            is_fast_charging: chargerProduct.isFastCharging,
          },
        ]);
        detailsError = error;
        break;
      }
      case "Cable": {
        const cableProduct = product as Omit<CableProduct, "id" | "createdAt">;
        const { error } = await supabase.from("cable_details").insert([
          {
            product_id: newId,
            type: cableProduct.type,
            length: cableProduct.length,
          },
        ]);
        detailsError = error;
        break;
      }
      case "AirPod": {
        const airPodProduct = product as Omit<
          AirPodProduct,
          "id" | "createdAt"
        >;
        const { error } = await supabase.from("airpod_details").insert([
          {
            product_id: newId,
          },
        ]);
        detailsError = error;
        break;
      }
    }

    if (detailsError) {
      console.error("Error creating product details:", detailsError);
      // Clean up the base product if details creation failed
      await supabase.from("products").delete().eq("id", newId);
      return null;
    }

    // Fetch the complete product with its details
    const { data: completeProduct, error: fetchError } = await supabase
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
      .eq("id", newId)
      .single();

    if (fetchError) {
      console.error("Error fetching complete product:", fetchError);
      return null;
    }

    // Convert to the appropriate product type
    const baseProductData = {
      id: ensureUUID(completeProduct.id),
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(String(completeProduct.price)) || 0,
      stock: parseInt(String(completeProduct.stock)) || 0,
      status: completeProduct.status || "available",
      category: completeProduct.category,
      createdAt: completeProduct.created_at
        ? new Date(completeProduct.created_at)
        : new Date(),
    };

    switch (completeProduct.category) {
      case "iPhone":
        return completeProduct.iphone_details
          ? ({
              ...baseProductData,
              category: "iPhone",
              color: completeProduct.iphone_details.color,
              storage: completeProduct.iphone_details.storage,
            } as iPhoneProduct)
          : null;
      case "Charger":
        return completeProduct.charger_details
          ? ({
              ...baseProductData,
              category: "Charger",
              wattage: completeProduct.charger_details.wattage,
              isFastCharging: completeProduct.charger_details.is_fast_charging,
            } as ChargerProduct)
          : null;
      case "Cable":
        return completeProduct.cable_details
          ? ({
              ...baseProductData,
              category: "Cable",
              type: completeProduct.cable_details.type,
              length: completeProduct.cable_details.length,
            } as CableProduct)
          : null;
      case "AirPod":
        return completeProduct.airpod_details
          ? ({
              ...baseProductData,
              category: "AirPod",
            } as AirPodProduct)
          : null;
      default:
        return null;
    }
  } catch (err) {
    console.error("Error in createProduct:", err);
    return null;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Product>
): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update product");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // First get the current product to know its category
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", uuid)
      .single();

    if (fetchError) {
      console.error("Error fetching current product:", fetchError);
      return null;
    }

    // Base update data
    const baseData = {
      name: product.name,
      description: product.description,
      price:
        product.price !== undefined
          ? parseFloat(String(product.price))
          : undefined,
      stock:
        product.stock !== undefined
          ? parseInt(String(product.stock))
          : undefined,
      status: product.status,
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(baseData).filter(([_, value]) => value !== undefined)
    );

    // Update base product
    const { data, error } = await supabase
      .from("products")
      .update(cleanedData)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return null;
    }

    // Update category-specific details
    let detailsError = null;
    switch (currentProduct.category) {
      case "iPhone": {
        const iPhoneProduct = product as Partial<iPhoneProduct>;
        if (iPhoneProduct.color || iPhoneProduct.storage) {
          const { error } = await supabase
            .from("iphone_details")
            .update({
              color: iPhoneProduct.color,
              storage: iPhoneProduct.storage,
            })
            .eq("product_id", uuid);
          detailsError = error;
        }
        break;
      }
      case "Charger": {
        const chargerProduct = product as Partial<ChargerProduct>;
        if (
          chargerProduct.wattage ||
          chargerProduct.isFastCharging !== undefined
        ) {
          const { error } = await supabase
            .from("charger_details")
            .update({
              wattage: chargerProduct.wattage,
              is_fast_charging: chargerProduct.isFastCharging,
            })
            .eq("product_id", uuid);
          detailsError = error;
        }
        break;
      }
      case "Cable": {
        const cableProduct = product as Partial<CableProduct>;
        if (cableProduct.type || cableProduct.length) {
          const { error } = await supabase
            .from("cable_details")
            .update({
              type: cableProduct.type,
              length: cableProduct.length,
            })
            .eq("product_id", uuid);
          detailsError = error;
        }
        break;
      }
    }

    if (detailsError) {
      console.error("Error updating product details:", detailsError);
      return null;
    }

    // Fetch the complete product with its details
    const { data: completeProduct, error: fetchCompleteError } = await supabase
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
      .eq("id", uuid)
      .single();

    if (fetchCompleteError) {
      console.error("Error fetching complete product:", fetchCompleteError);
      return null;
    }

    // Convert to the appropriate product type
    const baseProductData = {
      id: ensureUUID(completeProduct.id),
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(String(completeProduct.price)) || 0,
      stock: parseInt(String(completeProduct.stock)) || 0,
      status: completeProduct.status || "available",
      category: completeProduct.category,
      createdAt: completeProduct.created_at
        ? new Date(completeProduct.created_at)
        : new Date(),
    };

    switch (completeProduct.category) {
      case "iPhone":
        return completeProduct.iphone_details
          ? ({
              ...baseProductData,
              category: "iPhone",
              color: completeProduct.iphone_details.color,
              storage: completeProduct.iphone_details.storage,
            } as iPhoneProduct)
          : null;
      case "Charger":
        return completeProduct.charger_details
          ? ({
              ...baseProductData,
              category: "Charger",
              wattage: completeProduct.charger_details.wattage,
              isFastCharging: completeProduct.charger_details.is_fast_charging,
            } as ChargerProduct)
          : null;
      case "Cable":
        return completeProduct.cable_details
          ? ({
              ...baseProductData,
              category: "Cable",
              type: completeProduct.cable_details.type,
              length: completeProduct.cable_details.length,
            } as CableProduct)
          : null;
      case "AirPod":
        return {
          ...baseProductData,
          category: "AirPod",
        } as AirPodProduct;
      default:
        return null;
    }
  } catch (err) {
    console.error("Error in updateProduct:", err);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning false for delete product");
    return false;
  }

  try {
    const uuid = ensureUUID(id);
    const { error } = await supabase.from("products").delete().eq("id", uuid);

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
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty orders array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data.map((order) => ({
      id: ensureUUID(order.id),
      customerId: ensureUUID(order.customer_id),
      customerName: order.customer_name || "",
      employeeId: ensureUUID(order.employee_id),
      employeeName: order.employee_name || "",
      total: parseFloat(String(order.total)) || 0,
      createdAt: order.created_at ? new Date(order.created_at) : new Date(),
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        productId: ensureUUID(item.product_id),
        productName: item.product_name,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
    })) as Order[];
  } catch (err) {
    console.error("Error in fetchOrders:", err);
    return [];
  }
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null order");
    return null;
  }

  if (!id) {
    console.error("Order ID is required");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // First check if the order exists
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("id", uuid);

    if (countError) {
      console.error("Error checking order existence:", countError);
      return null;
    }

    if (!count) {
      console.warn(`No order found with ID: ${uuid}`);
      return null;
    }

    // Then fetch the order with its items
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", uuid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    if (!data) {
      console.warn(`No order data found with ID: ${uuid}`);
      return null;
    }

    return {
      id: ensureUUID(data.id),
      customerId: ensureUUID(data.customer_id),
      customerName: data.customer_name || "",
      employeeId: ensureUUID(data.employee_id),
      employeeName: data.employee_name || "",
      status: data.status || "pending",
      total: parseFloat(String(data.total)) || 0,
      items: (data.order_items || []).map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        productId: ensureUUID(item.product_id),
        productName: item.product_name || "Unknown Product",
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    } as Order;
  } catch (err) {
    console.error("Error in fetchOrderById:", err);
    return null;
  }
};

export const createOrder = async (
  order: Omit<Order, "id" | "createdAt">
): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create order");
    return null;
  }

  try {
    // First validate stock availability for all items
    for (const item of order.items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      if (productError) {
        console.error("Error checking product stock:", productError);
        throw new Error(`Failed to check stock for product ${item.productId}`);
      }

      if (!product || product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productName}. Available: ${
            product?.stock || 0
          }, Requested: ${item.quantity}`
        );
      }
    }

    const newId = uuidv4();

    // Prepare order data without items
    const orderData = {
      id: newId,
      customer_id: ensureUUID(order.customerId),
      customer_name: order.customerName,
      employee_id: ensureUUID(order.employeeId),
      employee_name: order.employeeName,
      total: parseFloat(String(order.total)) || 0,
      created_at: new Date().toISOString(),
    };

    // Create the order
    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return null;
    }

    // Prepare and insert order items
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map((item) => ({
        id: item.id || crypto.randomUUID(),
        order_id: newId,
        product_id: ensureUUID(item.productId),
        product_name: item.productName,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        // Attempt to delete the order since items failed
        await supabase.from("orders").delete().eq("id", newId);
        return null;
      }

      // Update product stock levels
      for (const item of order.items) {
        const { error: updateError } = await supabase.rpc("decrease_stock", {
          p_product_id: item.productId,
          p_quantity: item.quantity,
        });

        if (updateError) {
          console.error("Error updating product stock:", updateError);
          // Attempt to delete the order since stock update failed
          await supabase.from("orders").delete().eq("id", newId);
          throw new Error(
            `Failed to update stock for product ${item.productName}`
          );
        }
      }
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", newId)
      .single();

    if (fetchError) {
      console.error("Error fetching complete order:", fetchError);
      return null;
    }

    // Convert snake_case back to camelCase for the response
    return {
      id: ensureUUID(completeOrder.id),
      customerId: ensureUUID(completeOrder.customer_id),
      customerName: completeOrder.customer_name || "",
      employeeId: ensureUUID(completeOrder.employee_id),
      employeeName: completeOrder.employee_name || "",
      items: (completeOrder.order_items || []).map((item: any) => ({
        id: item.id,
        productId: ensureUUID(item.product_id),
        productName: item.product_name,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
      total: parseFloat(String(completeOrder.total)) || 0,
      createdAt: completeOrder.created_at
        ? new Date(completeOrder.created_at)
        : new Date(),
    } as Order;
  } catch (err) {
    console.error("Error in createOrder:", err);
    throw err;
  }
};

export const updateOrder = async (
  id: string,
  order: Partial<Order>
): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update order");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // First get the original order to compare item quantities
    const { data: originalOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", uuid)
      .single();

    if (fetchError) {
      console.error("Error fetching original order:", fetchError);
      return null;
    }

    // Create a map of original quantities by product ID
    const originalQuantities = new Map<string, number>();
    if (originalOrder?.order_items) {
      for (const item of originalOrder.order_items) {
        originalQuantities.set(item.product_id, item.quantity);
      }
    }

    // Update base order data
    const baseData = {
      total:
        order.total !== undefined ? parseFloat(String(order.total)) : undefined,
      customer_id: order.customerId,
      customer_name: order.customerName,
      employee_id: order.employeeId,
      employee_name: order.employeeName,
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(baseData).filter(([_, value]) => value !== undefined)
    );

    // Update base order
    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update(cleanedData)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return null;
    }

    // Update order items and handle stock changes
    if (order.items && order.items.length > 0) {
      // First validate stock availability for new/increased quantities
      for (const item of order.items) {
        const originalQty = originalQuantities.get(item.productId) || 0;
        const qtyDiff = item.quantity - originalQty;

        if (qtyDiff > 0) {
          // Check if we have enough stock for the increase
          const { data: product, error: productError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.productId)
            .single();

          if (productError) {
            console.error("Error checking product stock:", productError);
            throw new Error(
              `Failed to check stock for product ${item.productId}`
            );
          }

          if (!product || product.stock < qtyDiff) {
            throw new Error(
              `Insufficient stock for product ${item.productName}. Available: ${
                product?.stock || 0
              }, Additional Requested: ${qtyDiff}`
            );
          }
        }
      }

      // Handle stock updates for removed/changed items
      for (const [productId, originalQty] of originalQuantities.entries()) {
        const newItem = order.items.find(
          (item) => item.productId === productId
        );
        const qtyDiff = (newItem?.quantity || 0) - originalQty;

        if (qtyDiff < 0) {
          // Increase stock for reduced quantity
          const { error: increaseError } = await supabase.rpc(
            "increase_stock",
            {
              p_product_id: productId,
              p_quantity: Math.abs(qtyDiff),
            }
          );

          if (increaseError) {
            console.error("Error increasing stock:", increaseError);
            throw new Error(`Failed to update stock for product ${productId}`);
          }
        } else if (qtyDiff > 0) {
          // Decrease stock for increased quantity
          const { error: decreaseError } = await supabase.rpc(
            "decrease_stock",
            {
              p_product_id: productId,
              p_quantity: qtyDiff,
            }
          );

          if (decreaseError) {
            console.error("Error decreasing stock:", decreaseError);
            throw new Error(`Failed to update stock for product ${productId}`);
          }
        }
      }

      // Handle stock updates for new items
      for (const item of order.items) {
        if (!originalQuantities.has(item.productId)) {
          const { error: decreaseError } = await supabase.rpc(
            "decrease_stock",
            {
              p_product_id: item.productId,
              p_quantity: item.quantity,
            }
          );

          if (decreaseError) {
            console.error(
              "Error decreasing stock for new item:",
              decreaseError
            );
            throw new Error(
              `Failed to update stock for new product ${item.productId}`
            );
          }
        }
      }

      // Update order items
      const updatedItems = order.items.map((item) => ({
        id: item.id || crypto.randomUUID(),
        order_id: uuid,
        product_id: ensureUUID(item.productId),
        product_name: item.productName,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      }));

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", uuid);

      if (deleteError) {
        console.error("Error deleting order items:", deleteError);
        return null;
      }

      // Insert new items
      const { error: insertError } = await supabase
        .from("order_items")
        .insert(updatedItems);

      if (insertError) {
        console.error("Error updating order items:", insertError);
        return null;
      }
    }

    // Fetch the complete updated order
    const { data: completeOrder, error: fetchCompleteError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", uuid)
      .single();

    if (fetchCompleteError) {
      console.error("Error fetching complete order:", fetchCompleteError);
      return null;
    }

    // Convert to camelCase and return
    return {
      id: ensureUUID(completeOrder.id),
      customerId: ensureUUID(completeOrder.customer_id),
      customerName: completeOrder.customer_name || "",
      employeeId: ensureUUID(completeOrder.employee_id),
      employeeName: completeOrder.employee_name || "",
      items: (completeOrder.order_items || []).map((item: any) => ({
        id: item.id,
        productId: ensureUUID(item.product_id),
        productName: item.product_name,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
      total: parseFloat(String(completeOrder.total)) || 0,
      createdAt: completeOrder.created_at
        ? new Date(completeOrder.created_at)
        : new Date(),
    } as Order;
  } catch (err) {
    console.error("Error in updateOrder:", err);
    throw err;
  }
};

export const deleteOrder = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning false for delete order");
    return { success: false, error: "Database not configured" };
  }

  try {
    const uuid = ensureUUID(id);

    // First fetch the order items to get their quantities
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        order_items (
          product_id,
          quantity
        )
      `
      )
      .eq("id", uuid)
      .single();

    if (fetchError) {
      console.error("Error fetching order items:", fetchError);
      return { success: false, error: "Failed to fetch order items" };
    }

    // Restore stock for each product
    if (order?.order_items) {
      for (const item of order.order_items) {
        const { error: updateError } = await supabase.rpc("increase_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });

        if (updateError) {
          console.error("Error restoring product stock:", updateError);
          return { success: false, error: "Failed to restore product stock" };
        }
      }
    }

    // Delete order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", uuid);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      return { success: false, error: "Failed to delete order items" };
    }

    // Delete the order
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", uuid);

    if (orderError) {
      console.error("Error deleting order:", orderError);
      return { success: false, error: "Failed to delete order" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteOrder:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const deleteAllRecords = async () => {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase not configured, returning false for delete all records"
    );
    return { success: false, error: "Database not configured" };
  }

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

export const getCustomerPurchaseCount = async (
  customerId: string
): Promise<number> => {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase not configured, returning 0 for customer purchase count"
    );
    return 0;
  }

  try {
    const uuid = ensureUUID(customerId);
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", uuid);

    if (error) {
      console.error("Error getting customer purchase count:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Error in getCustomerPurchaseCount:", err);
    return 0;
  }
};

export interface EmployeeSalesMetrics {
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
}

export const getEmployeeSalesMetrics = async (
  employeeId: string
): Promise<EmployeeSalesMetrics> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning zero metrics");
    return {
      totalSales: 0,
      orderCount: 0,
      averageOrderValue: 0,
    };
  }

  try {
    const uuid = ensureUUID(employeeId);

    // Get all orders for the employee
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total")
      .eq("employee_id", uuid);

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
