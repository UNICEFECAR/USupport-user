import { addPlayAndHealWaitlistEntryQuery } from "#queries/playandhealWaitlist";

/**
 * Store a facilitators-network waiting-list signup.
 * A second signup with the same email is treated as success.
 */
export const joinPlayAndHealWaitlist = async ({
  fullName,
  email,
  location,
  language,
}) => {
  await addPlayAndHealWaitlistEntryQuery({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    location: location?.trim() || null,
    language,
  });

  return { success: true };
};
