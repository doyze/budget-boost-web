import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@/contexts/ThemeContext';

import Dashboard from "@/pages/Dashboard";
import AddTransaction from "@/pages/AddTransaction";
import Categories from "@/pages/Categories";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import DeleteTransaction from "./pages/DeleteTransaction";
import Accounts from "./pages/Accounts";
import YearlySummary from "./pages/YearlySummary";
import AccountDetail from "./pages/AccountDetail";

const App = () => (
  <TooltipProvider>
    <ThemeProvider>
      <Sonner />
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/add" element={
                  <ProtectedRoute>
                    <AddTransaction />
                  </ProtectedRoute>
                } />
                <Route path="/categories" element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                } />
                <Route path="/accounts" element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                } />
                <Route path="/yearly" element={
                  <ProtectedRoute>
                    <YearlySummary />
                  </ProtectedRoute>
                } />
                <Route path="/delete-transaction" element={
                  <ProtectedRoute>
                    <DeleteTransaction />
                  </ProtectedRoute>
                } />
                <Route path="/account/:accountId" element={
                  <ProtectedRoute>
                    <AccountDetail />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
    </ThemeProvider>
  </TooltipProvider>
);

export default App;
