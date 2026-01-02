import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EducationalConsultancy from "./pages/EducationalConsultancy";
import ManpowerRecruitment from "./pages/ManpowerRecruitment";
import ToursAndTravels from "./pages/ToursAndTravels";
import ApostilleServices from "./pages/ApostilleServices";
import Auth from "./pages/Auth";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BlogArchive from "./pages/BlogArchive";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/education" element={<EducationalConsultancy />} />
          <Route path="/educational-consultancy" element={<EducationalConsultancy />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/admin-recruitly-secure" element={<AdminDashboard />} />
          <Route path="/manpower-recruitment" element={<ManpowerRecruitment />} />
          <Route path="/tours-and-travels" element={<ToursAndTravels />} />
          <Route path="/apostille-services" element={<ApostilleServices />} />
          <Route path="/blog" element={<BlogArchive />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
