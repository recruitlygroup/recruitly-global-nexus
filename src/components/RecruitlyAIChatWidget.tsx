import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Step = "idle" | "open" | "submitting" | "done";

const MessageWidget = () => {
  const [step, setStep] = useState<Step>("idle");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) { setError("Please enter a message."); return; }
    setError(""); setStep("submitting");
    try {
      await supabase.from("intent_leads").insert([{
        full_name: name.trim() || null,
        email: contact.includes("@") ? contact.trim() : null,
        intent_query: message.trim().substring(0, 500),
        route: "DirectMessage", confidence_score: 1, detected_keywords: [],
        metadata: { source: "message_widget", contact },
      }]);
      setStep("done");
    } catch {
      setError("Something went wrong. Please try WhatsApp instead.");
      setStep("open");
    }
  };

  const reset = () => { setStep("idle"); setName(""); setContact(""); setMessage(""); setError(""); };

  return (
    <>
      <AnimatePresence>
        {step !== "idle" && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80">
            <div className="bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
                <div>
                  <p className="text-sm font-semibold text-foreground">Send us a message</p>
                  <p className="text-[11px] text-muted-foreground">We'll reply within a few hours</p>
                </div>
                <button onClick={reset} className="p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4">
                {step === "done" ? (
                  <div className="text-center py-6 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                    <p className="font-semibold text-foreground">Message received!</p>
                    <p className="text-xs text-muted-foreground">Our team will be in touch shortly.</p>
                    <Button onClick={reset} variant="ghost" size="sm" className="mt-2">Close</Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="h-9 text-sm" />
                    <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or WhatsApp" className="h-9 text-sm" />
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help you?"
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <Button onClick={handleSubmit} disabled={step === "submitting"} className="w-full h-9 text-sm">
                      {step === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send <Send className="w-3.5 h-3.5 ml-1.5" /></>}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {step === "idle" && (
        <motion.button onClick={() => setStep("open")}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
          aria-label="Send us a message"
          className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
          <MessageCircle className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default MessageWidget;
