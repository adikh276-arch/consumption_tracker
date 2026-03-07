import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import { AuthGuard } from "./components/AuthGuard";
import { initUser } from "./lib/checkin-storage";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const lang = params.get("lang");

      // Handle language sync
      if (lang && i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }

      const storedUserId = sessionStorage.getItem("user_id");

      if (token) {
        try {
          const response = await fetch("https://api.mantracare.com/user/user-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            const userId = data.user_id;
            sessionStorage.setItem("user_id", userId);

            // Initialize user in local database
            await initUser(userId);

            // Remove token from URL
            const url = new URL(window.location.href);
            url.searchParams.delete("token");
            window.history.replaceState({}, "", url.pathname + url.search);

            setIsAuthResolved(true);
          } else {
            window.location.href = "/token";
          }
        } catch (error) {
          console.error("Auth error:", error);
          window.location.href = "/token";
        }
      } else if (storedUserId) {
        setIsAuthResolved(true);
      } else {
        window.location.href = "/token";
      }
    };

    handleAuth();
  }, [i18n]);

  if (!isAuthResolved) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/consumption_tracker">
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
