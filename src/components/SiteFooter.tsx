import { Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import recruitlyLogo from "@/assets/recruitly-logo.png";

const SiteFooter = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={recruitlyLogo} alt="Recruitly Group" className="h-12 w-12 object-contain rounded-lg" />
              <span className="text-xl font-bold text-foreground">Recruitly Group</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Your trusted recruitment partner. Connecting skilled workers with verified international employers across Europe and the Middle East.
            </p>
            <div className="flex gap-4">
              <a href="https://linkedin.com/in/recruitly-group-1095b13a2" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </a>
              <a href="https://instagram.com/recruitlygroup" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              <li><a href="/work-abroad" className="text-muted-foreground hover:text-accent transition-colors">Work Abroad</a></li>
              <li><a href="/educational-consultancy" className="text-muted-foreground hover:text-accent transition-colors">Education Consultancy</a></li>
              <li><a href="/apostille-services" className="text-muted-foreground hover:text-accent transition-colors">Apostille Services</a></li>
              <li><a href="/tours-and-travels" className="text-muted-foreground hover:text-accent transition-colors">Tours & Travels</a></li>
            </ul>
          </div>

          {/* Contact & Offices */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact & Offices</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-1" />
                <span className="text-sm">Kathmandu, Nepal (Head Office)</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-1" />
                <span className="text-sm">Dubai, UAE (Regional Office)</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 mt-1" />
                <a href="mailto:info@recruitlygroup.com" className="hover:text-accent transition-colors break-all text-sm">info@recruitlygroup.com</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors text-sm">+977 974 320 8282</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Recruitly Group. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
