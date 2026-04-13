import { useEffect } from "react";
import { Instagram } from "lucide-react";

const SocialProofWall = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Instagram className="w-6 h-6 text-pink-500" />
          <a
            href="https://www.instagram.com/recruitlygroup/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
          >
            @recruitlygroup
          </a>
        </div>

        <iframe
          src="//lightwidget.com/widgets/231726b724b65c1cbe1425aa7d74a79f.html"
          scrolling="no"
          allowTransparency={true}
          className="w-full border-0 overflow-hidden"
          style={{ minHeight: 400 }}
          title="Recruitly Group Instagram Feed"
        />
      </div>
    </section>
  );
};

export default SocialProofWall;
