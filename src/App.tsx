import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EducationalConsultancy from "./pages/EducationalConsultancy";
import WorkAbroad from "./pages/WorkAbroad";
import ToursAndTravels from "./pages/ToursAndTravels";
import ApostilleServices from "./pages/ApostilleServices";
import BlogArchive from "./pages/BlogArchive";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/work-abroad" element={<WorkAbroad />} />
            <Route path="/jobs" element={<WorkAbroad />} />
            <Route path="/manpower-recruitment" element={<WorkAbroad />} />
            <Route path="/education" element={<EducationalConsultancy />} />
            <Route path="/educational-consultancy" element={<EducationalConsultancy />} />
            <Route path="/tours-and-travels" element={<ToursAndTravels />} />
            <Route path="/apostille-services" element={<ApostilleServices />} />
            <Route path="/blog" element={<BlogArchive />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
