import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { PageTransition } from "./PageTransition";
import { useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

interface LayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  loading?: boolean;
}

export default function Layout({
  children,
  title,
  description,
  action,
  loading = false,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Only show loading screen if we're coming from the password page
  const showLoadingScreen = loading && location.state?.from === "/password";

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <PageTransition>
          <div className="py-8">
            <div className="px-8 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-muted-foreground mt-2">{description}</p>
                  )}
                </div>
                {action && <div>{action}</div>}
              </div>
            </div>
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
