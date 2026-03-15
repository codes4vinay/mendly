import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Lock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { updateUser } from "@/features/auth/authSlice";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/DashboardLayout";

const profileSchema = z.object({
  name: z.string().min(2, "Name too short"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[!@#$%^&*]/, "Must contain special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isService, isAdmin } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: errProfile },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, phone: user?.phone || "" },
  });

  const {
    register: regPass,
    handleSubmit: handlePass,
    formState: { errors: errPass },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data) => {
    setLoadingProfile(true);
    try {
      const res = await api.put("/auth/update-profile", data);
      dispatch(updateUser(res.data.data.user));
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoadingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setLoadingPassword(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoadingPassword(false);
    }
  };

  const Wrapper = isService || isAdmin ? DashboardLayout : Layout;
  const pageTitle = isService ? "Service Profile" : "Profile";
  const pageDescription = isService
    ? "Manage your service-owner account settings"
    : "Manage your account settings";

  return (
    <Wrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">{pageDescription}</p>
        </div>

        {/* Avatar + Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{user?.role}</Badge>
              {user?.isEmailVerified ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 gap-1">
                  <CheckCircle className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  Not verified
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Update Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" /> Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleProfile(onUpdateProfile)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    {...regProfile("name")}
                    className={errProfile.name ? "border-red-500" : ""}
                  />
                  {errProfile.name && (
                    <p className="text-xs text-red-500">
                      {errProfile.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    {...regProfile("phone")}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loadingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handlePass(onChangePassword)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    {...regPass("currentPassword")}
                    className={errPass.currentPassword ? "border-red-500" : ""}
                  />
                  {errPass.currentPassword && (
                    <p className="text-xs text-red-500">
                      {errPass.currentPassword.message}
                    </p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    {...regPass("newPassword")}
                    className={errPass.newPassword ? "border-red-500" : ""}
                  />
                  {errPass.newPassword && (
                    <p className="text-xs text-red-500">
                      {errPass.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    {...regPass("confirmPassword")}
                    className={errPass.confirmPassword ? "border-red-500" : ""}
                  />
                  {errPass.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errPass.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loadingPassword}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loadingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Wrapper>
  );
};

export default Profile;
