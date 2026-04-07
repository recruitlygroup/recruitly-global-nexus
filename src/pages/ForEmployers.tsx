import { useSEO } from "@/hooks/useSEO";

const ForEmployers = () => {
  useSEO({
    title: "For Employers | Hire Skilled Workers – Recruitly Group",
    description: "Hire pre-vetted skilled workers from Nepal for your European business. Truck drivers, caregivers, welders and more.",
    canonicalUrl: "https://www.recruitlygroup.com/for-employers",
  });

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">For Employers</h1>
        <p className="text-muted-foreground text-lg">
          Recruitly Group connects European employers with pre-vetted, visa-ready workers from Nepal.
          Contact us to discuss your hiring needs.
        </p>
      </div>
    </div>
  );
};

export default ForEmployers;
