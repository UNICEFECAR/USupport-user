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

import { getYearInMilliseconds } from "#utils/helperFunctions";

const JWT_KEY = process.env.JWT_KEY;

export const issueAccessToken = async ({ user_id, userType, isMobile }) => {
  const payload = {
    sub: user_id,
    userType,
    iat: Math.floor(Date.now() / 1000),
  };

  const signedToken = jwt.sign(payload, JWT_KEY, {
    expiresIn: isMobile ? "9999y" : "2h",
    issuer: "online.usupport.userApi",
    audience: "online.usupport.app",
    algorithm: "HS256",
  });

  return {
    token: signedToken,
    expiresIn: isMobile
      ? new Date(new Date().getTime() + 9999 * getYearInMilliseconds())
      : new Date(new Date().getTime() + 1 * 60000), // 2h expiration
  };
};

export const issueTmpAccessToken = async () => {
  const payload = {
    sub: "tmp-user",
    userType: "client",
    iat: Math.floor(Date.now() / 1000),
  };

  const signedToken = jwt.sign(payload, JWT_KEY, {
    expiresIn: "9999 years", // never expires
    issuer: "online.usupport.userApi",
    audience: "online.usupport.app",
    algorithm: "HS256",
  });

  return {
    token: signedToken,
    expiresIn: new Date(new Date().getTime() + 9999 * getYearInMilliseconds()), // 9999 years expiration
  };
};

export const issueRefreshToken = async ({ country, user_id, userType }) => {
  const refreshToken = uuidv4();

  let expiryInterval = "";
  if (userType === "client") {
    expiryInterval = `${60 * 24 * 31}`; // 31 days
  } else if (userType === "provider") {
    expiryInterval = "150"; // 150 minutes
  }

  storeRefreshToken(country, user_id, refreshToken, expiryInterval).catch(
    (err) => {
      throw err;
    }
  );

  return refreshToken;
};

export const refreshAccessToken = async ({
  country,
  language,
  refreshToken,
}) => {
  const refreshTokenData = await getRefreshToken(country, refreshToken).then(
    (res) => {
      if (res.rowCount === 0) {
        throw invalidRefreshToken(language);
      } else {
        return res.rows[0];
      }
    }
  );

  const now = new Date().getTime();
  const expiresIn = new Date(refreshTokenData.expires_at).getTime();
  // valid for 31 days

  if (!refreshTokenData || refreshTokenData.used) {
    throw invalidRefreshToken(language);
  } else if (expiresIn < now) {
    await invalidateRefreshToken(country, refreshToken).catch((err) => {
      throw err;
    });
    throw invalidRefreshToken(language);
  } else {
    await invalidateRefreshToken(country, refreshToken).catch((err) => {
      throw err;
    });
    const newAccessToken = await issueAccessToken({
      user_id: refreshTokenData.user_id,
      userType: refreshTokenData.user_type,
    });
    const newRefreshToken = await issueRefreshToken({
      country,
      user_id: refreshTokenData.user_id,
      userType: refreshTokenData.user_type,
    });

    return {
      ...newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
};

export const generateAccessToken = async (country, language, retryStep = 0) => {
  if (retryStep === 3) {
    // Retry to generate new token 3 times if newly generated is used
    throw cannotGenerateUserAccessToken(language);
  }

  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 10);
  const newUserAccessToken = nanoid();

  const isAccessTokenAvailableQuery = await getClientUserByEmailOrAccessToken(
    country,
    null,
    newUserAccessToken
  ).catch((err) => {
    throw err;
  });

  if (isAccessTokenAvailableQuery.rowCount > 0) {
    return generateAccessToken(country, language, retryStep + 1);
  } else {
    return { userAccessToken: newUserAccessToken };
  }
};
