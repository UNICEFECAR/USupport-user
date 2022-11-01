import * as yup from "yup";

export const uploadFileSchema = yup.object().shape({
  fileName: yup.string().required(),
  fileContent: yup.mixed().required(),
  mimeType: yup.string().required(),
});
