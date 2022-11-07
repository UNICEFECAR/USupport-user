import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";

import {
  storeRefreshToken,
  getRefreshToken,
  invalidateRefreshToken,
} from "#queries/authTokens";
import { getClientUserByEmailOrAccessToken } from "#queries/users";

import {
  invalidRefreshToken,
  cannotGenerateUserAccessToken,
} from "#utils/errors";

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

  storeRefreshToken(user_id, refreshToken).catch((err) => {
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

  const now = new Date().getTime();
  const expiresIn = new Date(refreshTokenData.expires_at).getTime();
  // valid for 31 days

  if (!refreshTokenData || refreshTokenData.used) {
    throw invalidRefreshToken();
  } else if (expiresIn < now) {
    await invalidateRefreshToken(refreshToken).catch((err) => {
      throw err;
    });
    throw invalidRefreshToken();
  } else {
    await invalidateRefreshToken(refreshToken).catch((err) => {
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

export const generateAccessToken = async (retryStep = 0) => {
  if (retryStep === 3) {
    // Retry to generate new token 3 times if newly generated is used
    throw cannotGenerateUserAccessToken();
  }

  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 10);
  const newUserAccessToken = nanoid();

  const isAccessTokenAvailableQuery = await getClientUserByEmailOrAccessToken(
    null,
    newUserAccessToken
  ).catch((err) => {
    throw err;
  });

  if (isAccessTokenAvailableQuery.rowCount > 0) {
    return generateAccessToken(retryStep + 1);
  } else {
    return { userAccessToken: newUserAccessToken };
  }
};
