import * as yup from "yup";

export const getCountryByAlpha2CodeSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
});

export const updateCountryMinMaxClientAgeSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  minClientAge: yup.number().required(),
  maxClientAge: yup.number().required(),
});
