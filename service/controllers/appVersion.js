import { getAppVersionByPlatformQuery } from "#queries/appVersion";

import { compareVersions } from "#utils/helperFunctions";

export const getAppVersionStatus = async ({ platform, version, language }) => {
  const appVersion = await getAppVersionByPlatformQuery(platform)
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });

  if (!appVersion) return { updateType: "none" };

  let updateType = "none";
  if (compareVersions(version, appVersion.min_supported_version) < 0) {
    updateType = "forced";
  } else if (compareVersions(version, appVersion.latest_version) < 0) {
    updateType = "optional";
  }

  const releaseNotes = appVersion.release_notes || {};

  return {
    updateType,
    latestVersion: appVersion.latest_version,
    minSupportedVersion: appVersion.min_supported_version,
    storeUrl: appVersion.store_url,
    releaseNotes: releaseNotes[language] || releaseNotes.en || null,
  };
};
