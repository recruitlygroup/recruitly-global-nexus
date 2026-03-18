import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Camera,
  Loader2,
  Save,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email || "");

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (roleData) {
        setUserRole(roleData.role);
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setFullName(profileData.full_name || "");
        setAvatarUrl(profileData.avatar_url);
      } else {
        // Use user metadata as fallback
        setFullName(session.user.user_metadata?.full_name || "");
      }

      setIsLoading(false);
    };

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      await supabase.storage.from("avatars").remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add cache-busting parameter
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithCacheBust })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithCacheBust);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    // Validate name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 100) {
      toast({
        title: "Name too long",
        description: "Name must be less than 100 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Also update user_roles table if name exists there
      await supabase
        .from("user_roles")
        .update({ full_name: trimmedName })
        .eq("user_id", userId);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (userRole === "partner") {
      navigate("/partner-dashboard");
    } else {
      navigate("/candidate-dashboard");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Profile <span className="text-[#fbbf24]">Settings</span>
            </h1>
            <p className="text-white/60 text-sm">{email}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white">Your Profile</CardTitle>
              <CardDescription className="text-white/60">
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-2 border-[#fbbf24]/30">
                    <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                    <AvatarFallback className="bg-[#fbbf24]/20 text-[#fbbf24] text-2xl">
                      {fullName ? getInitials(fullName) : <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-white/50 text-sm">
                  Click to upload a new profile picture
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#fbbf24]"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-white/5 border-white/20 text-white/60 cursor-not-allowed"
                  />
                  <p className="text-white/40 text-xs">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Account Type</Label>
                  <div className="px-4 py-2 bg-white/5 border border-white/20 rounded-md">
                    <span className="text-[#fbbf24] capitalize">
                      {userRole || "User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#0a192f] font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfileSettings;
