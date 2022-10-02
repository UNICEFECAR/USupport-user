import * as yup from "yup";

export const getUserSchema = yup.object().shape({
  user_id: yup.string().uuid().required(),
});
