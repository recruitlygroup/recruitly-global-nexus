import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Download, 
  Mail, 
  FileText, 
  Briefcase,
  MapPin,
  Clock,
  Shield,
  Building2,
  Users,
  Globe,
  ChevronRight,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Job destinations data
const JOB_DESTINATIONS = [
  {
    country: "Poland",
    flag: "🇵🇱",
    category: "Warehouse / Factory",
    salaryRange: "€800 – €1,200/month",
    positions: "Multiple positions available"
  },
  {
    country: "Romania",
    flag: "🇷🇴",
    category: "Construction",
    salaryRange: "€900 – €1,400/month",
    positions: "Skilled & unskilled roles"
  },
  {
    country: "Croatia",
    flag: "🇭🇷",
    category: "Hospitality",
    salaryRange: "€700 – €1,100/month",
    positions: "Seasonal & permanent"
  },
  {
    country: "UAE",
    flag: "🇦🇪",
    category: "Drivers / Services",
    salaryRange: "AED 2,500 – 4,500/month",
    positions: "Licensed drivers preferred"
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    category: "Healthcare / Skilled Trades",
    salaryRange: "€2,000 – €3,500/month",
    positions: "Qualification required"
  },
  {
    country: "Saudi Arabia",
    flag: "🇸🇦",
    category: "Construction / Maintenance",
    salaryRange: "SAR 2,000 – 4,000/month",
    positions: "Experienced workers"
  }
];

// Why Recruitly points
const TRUST_POINTS = [
  {
    icon: Shield,
    title: "Verified International Employers",
    description: "All partner companies undergo background verification"
  },
  {
    icon: Building2,
    title: "Estonia-Registered Company",
    description: "EU-compliant legal entity with transparent operations"
  },
  {
    icon: Users,
    title: "Transparent Recruitment Stages",
    description: "Clear process from application to deployment"
  },
  {
    icon: Globe,
    title: "Support Until Deployment",
    description: "Assistance with documentation and travel arrangements"
  }
];

// Fee structure
const FEE_STRUCTURE = [
  { stage: "Application", fee: "Free" },
  { stage: "Interview", fee: "Free" },
  { stage: "Processing", fee: "After Employer Selection" },
  { stage: "Visa", fee: "As Per Embassy" }
];

// Timeline steps
const TIMELINE_STEPS = [
  { step: 1, label: "Application Review", duration: "1-3 days" },
  { step: 2, label: "Interview", duration: "1-2 weeks" },
  { step: 3, label: "Documentation", duration: "2-4 weeks" },
  { step: 4, label: "Visa Processing", duration: "4-8 weeks" },
  { step: 5, label: "Departure", duration: "Scheduled" }
];

const ManpowerRecruitment = () => {
  useSEO({
    title: "Manpower Recruitment | Jobs in Europe – Recruitly Group",
    description: "Find verified factory, warehouse & skilled jobs in Poland, Romania, and across Europe. Recruitly Group is your trusted manpower recruitment partner from Nepal.",
    keywords: "manpower recruitment Nepal, jobs in Poland, jobs in Romania, factory jobs Europe, work abroad Nepal, overseas employment",
    canonicalUrl: "https://www.recruitlygroup.com/manpower-recruitment",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "EmploymentAgency",
      "name": "Recruitly Group – Manpower Recruitment",
      "url": "https://www.recruitlygroup.com/manpower-recruitment",
    },
  });

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof JOB_DESTINATIONS[0] | null>(null);

  const handleApply = (job: typeof JOB_DESTINATIONS[0]) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleGeneralApply = () => {
    setSelectedJob(null);
    setShowApplicationModal(true);
  };

  const generateEmailSubject = () => {
    if (selectedJob) {
      return `Application – ${selectedJob.category} (${selectedJob.country}) – [Your Full Name]`;
    }
    return "Application – [Job Title] – [Your Full Name]";
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent(generateEmailSubject());
    const body = encodeURIComponent(
      `Dear Recruitly Team,\n\nI am interested in applying for a position.\n\nPlease find attached:\n- Completed application form\n- Passport copy\n- CV (if available)\n\nBest regards,\n[Your Name]`
    );
    window.location.href = `mailto:info@recruitlygroup.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            Recruitly Manpower Services
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-6 leading-tight">
            Get Hired Abroad.
            <br />
            <span className="text-accent">Not Just Registered.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-3xl mx-auto mb-10">
            Recruitly connects skilled and unskilled workers with verified international employers 
            through a transparent, selection-based recruitment process.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8 font-semibold"
              onClick={handleGeneralApply}
            >
              Apply for Current Openings
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg h-14 px-8"
              asChild
            >
              <a href="/documents/Recruitly_Application_Form.docx" download>
                <Download className="w-5 h-5 mr-2" />
                Download Application Form
              </a>
            </Button>
          </div>
        </motion.section>

        {/* Job Destinations Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Current Job Destinations
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse available opportunities across our partner countries. 
              Salary ranges are approximate and vary by experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOB_DESTINATIONS.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="h-full hover:border-accent/50 transition-colors group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{job.flag}</span>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{job.country}</h3>
                          <p className="text-sm text-muted-foreground">{job.category}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-muted-foreground">{job.positions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{job.salaryRange}</span>
                        <span className="text-xs text-muted-foreground">(approx.)</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                      variant="outline"
                      onClick={() => handleApply(job)}
                    >
                      Apply
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Apply Through Recruitly */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Apply Through Recruitly
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRUST_POINTS.map((point, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Transparent Fees */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transparent Fee Structure
            </h2>
            <p className="text-muted-foreground">
              Know exactly what to expect at each stage
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {FEE_STRUCTURE.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 md:p-6">
                    <span className="font-medium text-foreground">{item.stage}</span>
                    <span className={`font-semibold ${item.fee === 'Free' ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {item.fee}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Recruitment Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Average Recruitment Timeline
            </h2>
            <p className="text-muted-foreground">
              From application to departure
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Desktop Timeline */}
            <div className="hidden md:flex items-start justify-between relative">
              {/* Connection Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
              <div className="absolute top-6 left-0 h-0.5 bg-accent" style={{ width: '80%' }} />
              
              {TIMELINE_STEPS.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center text-center z-10" style={{ width: '18%' }}>
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg mb-3">
                    {step.step}
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{step.label}</h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-4">
              {TIMELINE_STEPS.map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{step.label}</h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </span>
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div className="absolute left-5 mt-10 w-0.5 h-4 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12 md:py-16"
        >
          <Card className="max-w-3xl mx-auto border-accent/30 bg-accent/5">
            <CardContent className="p-8 md:p-12">
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                Thousands apply. Only shortlisted candidates move forward.
              </p>
              <Button 
                size="lg" 
                className="text-lg h-14 px-10 font-semibold"
                onClick={handleGeneralApply}
              >
                Check If You Qualify
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.section>

        {/* Trust Badge Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-8"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Recruitly Group · Registered in Estonia 🇪🇪</span>
          </div>
        </motion.div>
      </div>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedJob 
                ? `Apply for ${selectedJob.category} in ${selectedJob.country}` 
                : "Apply for a Position"
              }
            </DialogTitle>
            <DialogDescription>
              Follow the steps below to submit your application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Download Application Form</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Fill out the official Recruitly application form with your details.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/recruitly-application-form.pdf" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download Form (PDF)
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Email Your Application</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Send your completed application to:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-accent" />
                    <span className="font-mono font-semibold text-foreground">info@recruitlygroup.com</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Subject format:</span>
                    <br />
                    <code className="bg-background px-2 py-1 rounded mt-1 inline-block">
                      {generateEmailSubject()}
                    </code>
                  </div>
                </div>
                <Button onClick={handleEmailClick} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Open Email Client
                </Button>
              </div>
            </div>

            {/* Required Attachments */}
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                Required Attachments
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Completed application form
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Passport copy (bio page)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  CV / Resume (if available)
                </li>
              </ul>
            </div>

            {/* Reassurance */}
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                <strong>You do not need to visit our office to apply.</strong>
                <br />
                <span className="text-muted-foreground">
                  All applications are processed remotely.
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManpowerRecruitment;