import { motion } from "framer-motion";
import { Shield, LayoutDashboard } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-slate-50 flex flex-col items-center justify-center">
      <div className="text-center space-y-8 max-w-md px-6">
        {/* Logo Animation */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-blue-200 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative p-4 bg-white rounded-2xl shadow-lg">
              <LayoutDashboard className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-800">
            Loading Dashboard
          </h2>
          <p className="text-slate-600 text-base">
            Preparing your workspace...
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div className="w-full max-w-xs mx-auto space-y-2">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          className="flex items-center justify-center gap-2 text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Shield className="w-4 h-4" />
          <span className="text-sm">Secure Connection</span>
        </motion.div>
      </div>
    </div>
  );
}
