import { CalendarDays, Clock, CalendarRange, History } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { useRevenueData } from "@/hooks/useRevenueData";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CardData {
  title: string;
  icon: React.ReactNode;
  revenue: number;
  orderCount: number;
  dateRange: string;
  bgClass: string;
  iconClass: string;
}

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

// Animation variants
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 2,
    scale: 0.98,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 20,
      mass: 0.5,
      duration: 0.6,
    },
  },
};

// Wrap the Card component with motion
const AnimatedCard = motion(Card);

// Card component to handle individual card rendering and animations
function RevenueCard({ card }: { card: CardData }) {
  const animatedRevenue = useCountAnimation(card.revenue);
  const animatedOrders = useCountAnimation(card.orderCount);

  return (
    <AnimatedCard
      variants={itemVariants}
      initial="hidden"
      animate="show"
      whileHover={{
        scale: 1.01,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 25,
        },
      }}
      className={cn(
        "border-0 shadow-lg ring-1 ring-gray-200/50",
        "bg-gradient-to-br",
        card.bgClass,
        "transition-all duration-200"
      )}
    >
      <CardHeader>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
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
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            className={cn(
              "p-3 rounded-full",
              card.bgClass.replace("from-", "bg-").split(" ")[0],
              card.iconClass
            )}
          >
            {card.icon}
          </motion.div>
          <div>
            <CardTitle className={cn("text-base font-medium", card.iconClass)}>
              {card.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {card.dateRange}
            </CardDescription>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 15,
            delay: 0.2,
          }}
        >
          <div className={cn("text-2xl font-bold", card.iconClass)}>
            ${animatedRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {animatedOrders.toLocaleString()} orders
          </div>
        </motion.div>
      </CardContent>
    </AnimatedCard>
  );
}

export function RevenueCards() {
  const { data: revenueData, isLoading } = useRevenueData();

  const cards: CardData[] = revenueData
    ? [
        {
          title: "Today",
          icon: <Clock className="h-5 w-5" />,
          revenue: revenueData.today.revenue,
          orderCount: revenueData.today.orderCount,
          dateRange: revenueData.today.dateRange || "",
          bgClass: "from-blue-500/10 via-blue-500/5 to-transparent",
          iconClass: "text-blue-500",
        },
        {
          title: "This Week",
          icon: <CalendarDays className="h-5 w-5" />,
          revenue: revenueData.thisWeek.revenue,
          orderCount: revenueData.thisWeek.orderCount,
          dateRange: revenueData.thisWeek.dateRange || "",
          bgClass: "from-emerald-500/10 via-emerald-500/5 to-transparent",
          iconClass: "text-emerald-500",
        },
        {
          title: "This Month",
          icon: <CalendarRange className="h-5 w-5" />,
          revenue: revenueData.thisMonth.revenue,
          orderCount: revenueData.thisMonth.orderCount,
          dateRange: revenueData.thisMonth.dateRange || "",
          bgClass: "from-purple-500/10 via-purple-500/5 to-transparent",
          iconClass: "text-purple-500",
        },
        {
          title: "Older",
          icon: <History className="h-5 w-5" />,
          revenue: revenueData.older.revenue,
          orderCount: revenueData.older.orderCount,
          dateRange: revenueData.older.dateRange || "",
          bgClass: "from-orange-500/10 via-orange-500/5 to-transparent",
          iconClass: "text-orange-500",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </>
    );
  }

  return (
    <>
      {cards.map((card, index) => (
        <RevenueCard key={index} card={card} />
      ))}
    </>
  );
}
