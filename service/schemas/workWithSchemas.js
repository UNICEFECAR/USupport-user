import * as yup from "yup";

export const getAllWorkWithSchema = yup.object().shape({
  country: yup.string().required(),
});
