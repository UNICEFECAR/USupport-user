import * as yup from "yup";

export const getCountryByAlpha2CodeSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
});

export const addCountryEventSchema = yup.object().shape({
  country: yup.string().nullable(),
  language: yup.string().required(),
  eventType: yup
    .string()
    .oneOf([
      "web_email_register_click",
      "web_anonymous_register_click",
      "web_guest_register_click",
      "web_schedule_button_click",
      "web_join_consultation_click",
      "mobile_email_register_click",
      "mobile_anonymous_register_click",
      "mobile_guest_register_click",
      "mobile_schedule_button_click",
      "mobile_join_consultation_click",
      "web_consultation_scheduled",
      "mobile_consultation_scheduled",
      "global_visit",
    ])
    .required(),
  clientDetailId: yup.string().uuid().nullable(),
  visitorId: yup.string().uuid().nullable(),
});
