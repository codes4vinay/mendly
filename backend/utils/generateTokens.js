import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";
import { refreshCookieOptions } from "./refreshCookieOptions.js";

const generateTokens = async (userId, ip, res) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    const refreshTokenValue = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        user: userId,
        token: refreshTokenValue,
        expiresAt,
        createdByIp: ip,
    });

    res.cookie("refresh_token", refreshTokenValue, refreshCookieOptions);

    return { accessToken };
};

export default generateTokens;
