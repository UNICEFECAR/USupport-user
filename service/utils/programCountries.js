// Pseudo-countries of the separate programme websites. They have no PII or
// clinical databases and are only listed on the platforms that need them.
export const PLAY_AND_HEAL_COUNTRY = "PS";
export const HOSN_EL_HAL_COUNTRY = "XH";

const PROGRAM_COUNTRY_PLATFORMS = {
  [PLAY_AND_HEAL_COUNTRY]: ["country-admin", "website"],
  [HOSN_EL_HAL_COUNTRY]: ["country-admin", "global-admin"],
};

// Events always recorded under a programme country, whatever country the
// visitor has selected
export const EVENT_COUNTRIES = {
  hosnelhal_visit: HOSN_EL_HAL_COUNTRY,
};

export const isCountryListedOnPlatform = (alpha2, platform) =>
  !PROGRAM_COUNTRY_PLATFORMS[alpha2] ||
  PROGRAM_COUNTRY_PLATFORMS[alpha2].includes(platform);
