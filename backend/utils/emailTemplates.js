// OTP email templates — keeps email HTML out of controllers

export const verifyEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Verify Your Email</h2>
    <p>Your OTP to verify your RPAR account is:</p>
    <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
    <p>This OTP expires in <strong>10 minutes</strong>.</p>
    <p>If you did not create an account, please ignore this email.</p>
  </div>
`;

export const forgotPasswordTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Reset Your Password</h2>
    <p>Your OTP to reset your RPAR password is:</p>
    <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
    <p>This OTP expires in <strong>10 minutes</strong>.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  </div>
`;