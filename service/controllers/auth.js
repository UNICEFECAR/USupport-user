import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  storeRefreshToken,
  getRefreshToken,
  invalidateRefreshToken,
} from "#queries/authTokens";

import { invalidRefreshToken } from "#utils/errors";

const JWT_KEY = process.env.JWT_KEY;

export const issueAccessToken = async ({ user_id }) => {
  const payload = { sub: user_id, iat: Math.floor(Date.now() / 1000) };

  const signedToken = jwt.sign(payload, JWT_KEY, {
    expiresIn: "2h",
    issuer: "online.usupport.userApi",
    audience: "online.usupport.app",
    algorithm: "HS256",
  });

  return {
    token: signedToken,
    expiresIn: new Date(new Date().getTime() + 120 * 60000), // 2h expiration
  };
};

export const issueRefreshToken = async ({ user_id }) => {
  const refreshToken = uuidv4();

  storeRefreshToken(user_id).catch((err) => {
    throw err;
  });

  return refreshToken;
};

export const refreshAccessToken = async ({ refreshToken }) => {
  const refreshTokenData = await getRefreshToken(refreshToken)
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });

  if (!refreshTokenData || refreshTokenData.used) {
    throw invalidRefreshToken();
  } else {
    await invalidateRefreshToken(refreshAccessToken).catch((err) => {
      throw err;
    });
    const newAccessToken = await issueAccessToken({
      user_id: refreshTokenData.user_id,
    });
    const newRefreshToken = await issueRefreshToken({
      user_id: refreshTokenData.user_id,
    });

    return {
      ...newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
};
