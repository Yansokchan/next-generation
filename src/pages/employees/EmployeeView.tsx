import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Edit,
  Trash,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Briefcase,
  Building2,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  CircleDot,
  X,
  ZoomIn,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchEmployeeById,
  getEmployeeSalesMetrics,
  updateEmployee,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id || ""),
    enabled: !!id,
  });

  const { data: salesMetrics, isLoading: isLoadingSales } = useQuery({
    queryKey: ["employee-sales", id],
    queryFn: () => getEmployeeSalesMetrics(id || ""),
    enabled: !!id && employee?.department === "Sales",
  });

  const queryClient = useQueryClient();

  const toggleStatus = useMutation({
    mutationFn: async () => {
      if (!employee || !id) return null;
      const newStatus = employee.status === "active" ? "inactive" : "active";
      return await updateEmployee(id, { status: newStatus });
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["employee", id] });
      await queryClient.cancelQueries({ queryKey: ["employees"] });

      // Snapshot the previous value
      const previousEmployee = queryClient.getQueryData(["employee", id]);

      // Optimistically update to the new value
      if (employee) {
        const optimisticEmployee = {
          ...employee,
          status: employee.status === "active" ? "inactive" : "active",
        };

        // Update both queries optimistically
        queryClient.setQueryData(["employee", id], optimisticEmployee);
        queryClient.setQueryData(["employees"], (old: any) => {
          if (!old) return old;
          return old.map((emp: any) =>
            emp.id === id ? optimisticEmployee : emp
          );
        });
      }

      // Return a context object with the snapshotted value
      return { previousEmployee };
    },
    onError: (err, newEmployee, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEmployee) {
        queryClient.setQueryData(["employee", id], context.previousEmployee);
        queryClient.setQueryData(["employees"], (old: any) => {
          if (!old) return old;
          return old.map((emp: any) =>
            emp.id === id ? context.previousEmployee : emp
          );
        });
      }

      toast({
        title: "Update failed",
        description: "Failed to update employee status. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Status updated",
          description: `Employee is now ${data.status}.`,
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const statusConfirmation = useConfirmation({
    title:
      employee?.status === "active"
        ? "Set Employee as Inactive"
        : "Set Employee as Active",
    description:
      employee?.status === "active"
        ? "Are you sure you want to set this employee as inactive? This will prevent them from being assigned to new tasks."
        : "Are you sure you want to set this employee as active? This will allow them to be assigned to new tasks.",
    confirmText:
      employee?.status === "active" ? "Set as Inactive" : "Set as Active",
    onConfirm: () => toggleStatus.mutate(),
    variant: employee?.status === "active" ? "destructive" : "default",
  });

  if (isLoadingEmployee) {
    return (
      <Layout title="Employee Details">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </Button>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout title="Employee Not Found">
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate("/employees")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <h3 className="text-lg font-semibold">Employee Not Found</h3>
                <p className="text-muted-foreground">
                  The requested employee could not be found.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Employee Details"
      description="View detailed employee information."
    >
      {/* Full screen image preview */}
      <AnimatePresence>
        {showFullImage && employee.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              className="relative max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-20 -right-52 text-white hover:bg-white/20"
                onClick={() => setShowFullImage(false)}
              >
                <X className="h-8 w-8" />
              </Button>
              <motion.img
                src={employee.image_url}
                alt={`${employee.name}'s profile`}
                className="w-full h-auto rounded-lg shadow-2xl"
                layoutId="profile-image"
                style={{
                  maxHeight: "90vh",
                  objectFit: "contain",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/employees")}
            className="gap-2 text-base text-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Employees
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/employees/${id}/edit`)}
              className="gap-2 text-base hover:bg-blue-50"
            >
              <Edit className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">Edit</span>
            </Button>
            <Button
              variant={employee.status === "active" ? "destructive" : "default"}
              onClick={() => statusConfirmation.open()}
              className="gap-2 text-base"
              disabled={toggleStatus.isPending}
            >
              <CircleDot className="h-5 w-5" />
              {toggleStatus.isPending
                ? "Updating..."
                : employee.status === "active"
                ? "Set as Inactive"
                : "Set as Active"}
            </Button>
          </div>
        </div>

        {/* Employee Details Card */}
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-100/80 via-indigo-200/80 to-purple-200/90 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-t-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg flex-shrink-0 relative cursor-pointer border-2 border-white/80"
                    onClick={() => employee.image_url && setShowFullImage(true)}
                  >
                    {employee.image_url ? (
                      <>
                        {isImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          </div>
                        )}
                        <motion.img
                          layoutId="profile-image"
                          src={employee.image_url}
                          alt={`${employee.name}'s profile`}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          style={{ opacity: isImageLoading ? 0 : 1 }}
                          onLoad={() => setIsImageLoading(false)}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <User className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-200 blur-sm -z-10" />
                </motion.div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {employee.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <CardDescription className="text-base flex items-center gap-2">
                          {employee.position}
                          <span>•</span>
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {employee.department}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      employee.status === "active" ? "default" : "secondary"
                    }
                    className={`mt-2 ${
                      employee.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <CircleDot
                      className={`h-3 w-3 mr-1 ${
                        employee.status === "active"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    />
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="gap-2 py-2 px-4 text-base bg-white shadow-sm"
              >
                <Calendar className="h-5 w-5 text-blue-600" />
                {(() => {
                  try {
                    const date = new Date(employee.hireDate);
                    return isNaN(date.getTime())
                      ? "Invalid Date"
                      : format(date, "MMM d, yyyy");
                  } catch (error) {
                    return "Invalid Date";
                  }
                })()}
              </Badge>
            </div>
          </CardHeader>

          <Separator className="bg-gray-200" />

          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </p>
                    <p className="text-lg font-medium text-blue-600">
                      {employee.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </p>
                    <p className="text-lg font-medium text-blue-600">
                      {employee.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Salary
                    </p>
                    <p className="text-lg font-medium text-blue-600">
                      ${employee.salary.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </p>
                    <p className="text-lg font-medium text-blue-600">
                      {employee.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Employee ID
                    </p>
                    <p className="text-base font-mono text-blue-600">
                      {employee.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance Card */}
        {employee.department === "Sales" && (
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-100/80 via-indigo-200/80 to-purple-200/90 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-t-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Sales Performance
                </CardTitle>
              </div>
            </CardHeader>

            <Separator className="bg-gray-200" />

            <CardContent className="pt-8 pb-8 px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <ShoppingCart className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-400 mb-1">
                      Orders Processed
                    </p>
                    {isLoadingSales ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                        <span className="text-base">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-purple-500">
                        {salesMetrics?.orderCount || 0}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400 mb-1">
                      Total Sales Amount
                    </p>
                    {isLoadingSales ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                        <span className="text-base">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-green-500">
                        ${(salesMetrics?.totalSales || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <ConfirmationDialog {...statusConfirmation.dialogProps} />
    </Layout>
  );
};

export default EmployeeView;
