export const PEER_SUPPORT = "peer_support";

export const BASE_PROVIDER_SPECIALIZATIONS = [
  "psychologist",
  "psychotherapist",
  "psychiatrist",
];

export const ARMENIA_ONLY_SPECIALIZATIONS = [PEER_SUPPORT];

export const getProviderSpecializationsForCountry = (country) => {
  const specializations = [...BASE_PROVIDER_SPECIALIZATIONS];

  if (country?.toUpperCase() === "AM") {
    specializations.push(...ARMENIA_ONLY_SPECIALIZATIONS);
  }

  return specializations;
};

export const isValidSpecializations = (specializations, country) => {
  if (!specializations?.length) {
    return true;
  }

  const allowed = getProviderSpecializationsForCountry(country);

  if (!specializations.every((specialization) => allowed.includes(specialization))) {
    return false;
  }

  if (specializations.includes(PEER_SUPPORT) && specializations.length > 1) {
    return false;
  }

  return true;
};
