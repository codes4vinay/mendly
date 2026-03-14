import crypto from "crypto";

const generateOtp = () => {
    // generates a random 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // OTP expires in 10 minutes
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    return { otp, otpExpires };
};

export default generateOtp;