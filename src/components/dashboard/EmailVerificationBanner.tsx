import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Mail, CheckCircle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmailVerificationBannerProps {
  email: string;
  isVerified: boolean;
}

export const EmailVerificationBanner = ({ email, isVerified }: EmailVerificationBannerProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);

  if (isVerified || dismissed) return null;

  const handleResendVerification = async () => {
    setSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-medium text-foreground">Verify your email</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please verify your email address ({email}) to unlock all features and secure your account.
              </p>
            </div>

            {sent ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                <span>Verification email sent! Check your inbox.</span>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={sending}
                className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
