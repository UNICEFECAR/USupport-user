import bcrypt from "bcryptjs";

import twilio from "twilio";

import { updateUserPassword } from "#queries/users";

const AccessToken = twilio.jwt.AccessToken;
const { VideoGrant } = AccessToken;

export const updatePassword = async ({ poolCountry, user_id, password }) => {
  const salt = await bcrypt.genSalt(12);
  const hashedPass = await bcrypt.hash(password, salt);

  await updateUserPassword({
    poolCountry,
    user_id,
    password: hashedPass,
  }).catch((err) => {
    throw err;
  });
};

export const getYearInMilliseconds = () => {
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  return year;
};

export const generateToken = (config) => {
  return new AccessToken(
    config.twilio.accountSid,
    config.twilio.apiSid,
    config.twilio.apiSecret
  );
};

export const videoToken = (identity, room, config) => {
  let videoGrant;
  if (typeof room !== "undefined") {
    videoGrant = new VideoGrant({ room });
  } else {
    videoGrant = new VideoGrant();
  }
  const token = generateToken(config);
  token.addGrant(videoGrant);
  token.identity = identity;
  return token;
};
export const generatePassword = (length) => {
  const letterPattern = /[a-zA-Z0-9]/;
  const passwordPattern = new RegExp(
    "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"
  );

  const getRandomByte = () => {
    return Math.floor(Math.random() * 256);
  };

  const tempPassword = () =>
    Array.apply(null, { length })
      .map(() => {
        let result;
        while (true) {
          result = String.fromCharCode(getRandomByte());
          if (letterPattern.test(result)) {
            return result;
          }
        }
      })
      .join("");

  const password = tempPassword();
  if (passwordPattern.test(password)) return password;
  else return generatePassword(length);
};

export const generate4DigitCode = () => {
  return Math.floor(Math.random() * 9000 + 1000);
};
