import { useState } from "react";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareBarProps {
  title: string;
  url: string;
}

const SocialShareBar = ({ title, url }: SocialShareBarProps) => {
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="flex items-center justify-center gap-3 py-8 border-t border-border/50"
    >
      <span className="text-sm text-muted-foreground mr-2">Share this article:</span>
      
      <Button
        variant="outline"
        size="icon"
        className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => window.open(shareLinks.twitter, "_blank", "noopener,noreferrer")}
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => window.open(shareLinks.linkedin, "_blank", "noopener,noreferrer")}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={copyLink}
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </Button>
    </motion.div>
  );
};

export default SocialShareBar;
