import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import {
  Users,
  Briefcase,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  Home,
  Plus,
  Hash,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  fetchCustomers,
  fetchEmployees,
  fetchProducts,
  fetchOrders,
  fetchCustomerById,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueCards } from "@/components/RevenueCards";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    rotateX: -15,
    transformPerspective: 1000,
  },
  show: {
    opacity: 1,
    x: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
      mass: 1,
    },
  },
};

// Custom hook for counting animation
const useCountAnimation = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
};

// Wrap the Card component with motion
const AnimatedCard = motion(Card);

const Index = () => {
  const navigate = useNavigate();

  // Fetch data from Supabase
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await fetchOrders();
      const ordersWithCustomers = await Promise.all(
        orders.map(async (order) => {
          const customer = await fetchCustomerById(order.customerId);
          return {
            ...order,
            customerName: customer?.name || "Unknown Customer",
          };
        })
      );
      return ordersWithCustomers;
    },
  });

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // Animated counts
  const animatedCustomers = useCountAnimation(customers.length);
  const animatedEmployees = useCountAnimation(employees.length);
  const animatedProducts = useCountAnimation(products.length);
  const animatedOrders = useCountAnimation(orders.length);
  const animatedRevenue = useCountAnimation(totalRevenue);

  // Get 5 most recent orders
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const menuItems = [
    {
      title: "Customers",
      description: "Manage customer information and details",
      icon: Users,
      stats: `${animatedCustomers} total`,
      primaryPath: "/customers",
      secondaryPath: "/customers/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
    {
      title: "Employees",
      description: "Manage employee records and information",
      icon: Briefcase,
      stats: `${animatedEmployees} total`,
      primaryPath: "/employees/list",
      secondaryPath: "/employees/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
    {
      title: "Products",
      description: "Manage product catalog and inventory",
      icon: Package,
      stats: `${animatedProducts} total`,
      primaryPath: "/products",
      secondaryPath: "/products/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
    {
      title: "Orders",
      description: "Track and manage customer orders",
      icon: ShoppingCart,
      stats: `${animatedOrders} total`,
      primaryPath: "/orders",
      secondaryPath: "/orders/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
  ];

  // Loading state
  if (
    isLoadingCustomers ||
    isLoadingEmployees ||
    isLoadingProducts ||
    isLoadingOrders
  ) {
    return (
      <Layout
        title="Dashboard"
        description="Welcome to your business management dashboard."
      >
        <div className="space-y-6">
          <Skeleton className="h-[120px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
      description="Welcome to your business management dashboard."
    >
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Revenue Overview */}
        <AnimatedCard
          variants={itemVariants}
          className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent ring-1 ring-blue-100"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  Total Revenue
                </CardTitle>
                <CardDescription>
                  Overall revenue from all orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              ${animatedRevenue.toLocaleString()}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Revenue Time Period Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <RevenueCards />
        </motion.div>

        {/* Main Menu Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {menuItems.map((item, index) => {
            const colorSchemes = {
              0: {
                gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
                iconBg: "bg-indigo-500/10",
                iconColor: "text-indigo-500",
                statsColor: "text-indigo-600",
                buttonBg: "",
              },
              1: {
                gradient:
                  "from-emerald-500/10 via-emerald-500/5 to-transparent",
                iconBg: "bg-emerald-500/10",
                iconColor: "text-emerald-500",
                statsColor: "text-emerald-600",
                buttonBg: "",
              },
              2: {
                gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
                iconBg: "bg-orange-500/10",
                iconColor: "text-orange-500",
                statsColor: "text-orange-600",
                buttonBg: "",
              },
              3: {
                gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
                iconBg: "bg-purple-500/10",
                iconColor: "text-purple-500",
                statsColor: "text-purple-600",
                buttonBg: "",
              },
            };

            const colors = colorSchemes[index as keyof typeof colorSchemes];

            return (
              <AnimatedCard
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className={cn(
                  "overflow-hidden border-0 shadow-lg",
                  "bg-gradient-to-br",
                  colors.gradient,
                  "transition-all duration-500"
                )}
              >
                <CardHeader>
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: 0.1,
                    }}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        },
                      }}
                      className={cn("p-3 rounded-full", colors.iconBg)}
                    >
                      <item.icon className={cn("h-6 w-6", colors.iconColor)} />
                    </motion.div>
                    <div>
                      <CardTitle
                        className={`text-lg font-semibold ${colors.iconColor}`}
                      >
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </div>
                  </motion.div>
                </CardHeader>

                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 15,
                      delay: 0.2,
                    }}
                  >
                    <div
                      className={cn("text-2xl font-bold", colors.statsColor)}
                    >
                      {item.stats}
                    </div>
                  </motion.div>
                </CardContent>

                <CardFooter className="flex justify-between gap-2 border-t pt-4">
                  <Button
                    variant="default"
                    onClick={() => navigate(item.primaryPath)}
                    className={cn(
                      "flex-1",
                      colors.buttonBg,
                      "text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    )}
                  >
                    {item.primaryText}
                  </Button>
                  {item.secondaryPath && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(item.secondaryPath)}
                      className={cn(
                        "border-gray-200 hover:border-gray-300",
                        "hover:bg-gray-50",
                        "text-gray-600 hover:text-gray-800"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </AnimatedCard>
            );
          })}
        </motion.div>

        {/* Recent Orders */}
        <AnimatedCard
          variants={itemVariants}
          initial="hidden"
          animate="show"
          className="shadow-lg border-0 ring-1 ring-gray-200"
        >
          <div className="p-6 bg-gradient-to-r from-blue-100/80 via-indigo-200/80 to-purple-200/90 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-t-sm">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  <ShoppingCart className="h-7 w-7 text-blue-600" />
                  Recent Orders
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-white text-blue-600 border-blue-100 shadow-sm"
                  >
                    Last {recentOrders.length} orders
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => navigate("/orders")}
                size="lg"
                className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                View All Orders
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-500/10">
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">
                        Order ID
                      </span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">
                        Customer
                      </span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Total</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Date</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {order.customerName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AnimatedCard>
      </motion.div>
    </Layout>
  );
};

export default Index;
