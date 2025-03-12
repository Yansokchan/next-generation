import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Key, AlertCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordProtection() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Show content with animation after mount
  useEffect(() => {
    setShowContent(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = login(password);
      if (!success) {
        throw new Error("Invalid password");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Invalid password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: "/password" }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div
        className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="relative">
          {/* Logo/Icon Container */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-logo-entrance">
              <Lock className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl px-8 pt-14 pb-8 mb-4 transform transition-all"
          >
            <div className="mb-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">
                  Welcome Back
                </h2>
                <p className="text-gray-600 animate-fade-in animation-delay-200">
                  Please enter the password to continue
                </p>
              </div>

              <div className="space-y-4 animate-fade-in animation-delay-400">
                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 animate-fade-in animation-delay-600
                ${
                  isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white hover:shadow-lg"
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span className="ml-2">Verifying...</span>
                </div>
              ) : (
                "Enter"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
