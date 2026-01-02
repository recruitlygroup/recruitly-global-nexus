import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NewsletterBoxProps {
  variant?: 'sidebar' | 'full';
}

const NewsletterBox = ({ variant = 'sidebar' }: NewsletterBoxProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success('Thank you for subscribing!', {
      description: 'You will receive our latest updates in your inbox.',
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-primary-foreground"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated with Our Newsletter
          </h3>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Get the latest insights on global careers, education opportunities, and immigration news delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shrink-0"
            >
              {isSubmitting ? 'Joining...' : 'Join Now'}
              <Send className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-accent" />
        </div>
        <h4 className="font-semibold text-foreground">Newsletter</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Subscribe to get the latest updates and insights.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isSubmitting ? 'Joining...' : 'Join'}
        </Button>
      </form>
    </div>
  );
};

export default NewsletterBox;
