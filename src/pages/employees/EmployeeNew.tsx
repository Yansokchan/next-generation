import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/lib/types";
import { employees } from "@/lib/data";
import { createEmployee, uploadEmployeeImage } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Card } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  Briefcase,
  Building2,
  DollarSign,
  Upload,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const EmployeeNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: 40000,
    status: "active",
  });

  const departments = ["Engineering", "Marketing", "Sales", "Support", "HR"];
  const positions = ["Manager", "Senior", "Junior", "Intern", "Lead"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEmployee = async () => {
    try {
      // Create employee first
      const result = await createEmployee(
        formData as Omit<Employee, "id" | "hireDate">
      );

      if (!result.success || !result.data) {
        // Handle specific error cases
        toast({
          title: "Error",
          description: result.error || "Failed to create employee",
          variant: "destructive",
        });
        return;
      }

      // If employee creation was successful and we have an image, upload it
      if (selectedImage) {
        try {
          const imageUrl = await uploadEmployeeImage(
            result.data.id,
            selectedImage
          );
          if (!imageUrl) {
            toast({
              title: "Warning",
              description: "Employee created but failed to upload image.",
              variant: "warning",
            });
          }
        } catch (imageError: any) {
          console.error("Error uploading image:", imageError);
          toast({
            title: "Warning",
            description: "Employee created but failed to upload image.",
            variant: "warning",
          });
        }
      }

      toast({
        title: "Success",
        description: "Employee has been successfully created.",
      });

      navigate("/employees");
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description:
          error.message || "There was a problem creating the employee.",
        variant: "destructive",
      });
    }
  };

  const saveConfirmation = useConfirmation({
    title: "Create New Employee",
    description: "Are you sure you want to create this employee?",
    confirmText: "Create Employee",
    onConfirm: saveEmployee,
    variant: "default",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email || "")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Required fields validation
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "position",
      "department",
    ] as const;
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please fill in the following fields: ${missingFields.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    saveConfirmation.open();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <Layout title="New Employee" description="Create a new employee record.">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden">
          <FormLayout
            title={
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  New Employee
                </span>
              </div>
            }
            description="Add a new employee to your organization."
            onSubmit={handleSubmit}
            backPath="/employees"
            className="p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Image Upload */}
              <motion.div
                className="md:col-span-2 space-y-3"
                whileTap={{ scale: 0.995 }}
              >
                <Label className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Upload className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Profile Image
                    </span>
                  </div>
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-md flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <User className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <Label
                      htmlFor="profile-image"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose Image</span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: Square image, max 5MB
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Full Name
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Email Address
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="position" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Position
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      handleSelectChange("position", value)
                    }
                  >
                    <SelectTrigger
                      id="position"
                      className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    >
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label
                  htmlFor="department"
                  className="text-gray-700 font-medium"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Department
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleSelectChange("department", value)
                    }
                  >
                    <SelectTrigger
                      id="department"
                      className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-3 md:col-span-2"
                whileTap={{ scale: 0.995 }}
              >
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Address
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St, City, Country"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="salary" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Salary
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    placeholder="50000"
                    value={formData.salary}
                    onChange={handleNumericChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>
            </div>
          </FormLayout>
        </Card>
      </motion.div>
      <ConfirmationDialog {...saveConfirmation.dialogProps} />
    </Layout>
  );
};

export default EmployeeNew;
