import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authApi } from "@/features/auth/authApi";
import { updateUser } from "@/features/auth/authSlice";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, purpose } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  // handle OTP input
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // auto focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  // handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: otpString, purpose });
      toast.success(
        purpose === "verify_email" ? "Email verified!" : "OTP verified!",
      );
      if (purpose === "verify_email") {
        dispatch(updateUser({ isEmailVerified: true }));
        navigate("/");
      } else {
        navigate("/reset-password", { state: { email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.sendOtp({ email, purpose });
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Wrench className="h-6 w-6 text-white" />
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 rounded-xl bg-background focus:border-indigo-600 focus:outline-none transition-colors"
                />
              ))}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            {/* Resend */}
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive OTP?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-600 hover:underline font-medium"
              >
                {resending ? "Resending..." : "Resend"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
