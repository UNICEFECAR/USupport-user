import express from "express";

import {
  getSharedUserData,
  changeUserPassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getTwilioToken,
  addContactForm,
} from "#controllers/users";

import { securedRoute } from "#middlewares/auth";
import {
  getUserByIdSchema,
  changePasswordSchema,
  getNotificationPreferencesSchema,
  updateNotificationPreferencesSchema,
  getTwilioTokenSchema,
  addContactFormSchema,
} from "#schemas/userSchemas";

const router = express.Router();

router.get("/", securedRoute, async (req, res, next) => {
  /**
   * #route   GET /user/v1/user
   * #desc    Get shared user data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const user_id = req.user.user_id;

  return await getUserByIdSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, user_id })
    .then(getSharedUserData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.patch("/password", securedRoute, async (req, res, next) => {
  /**
   * #route   PATCH /user/v1/user/password
   * #desc    Update user's password
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const user_id = req.user.user_id;
  const payload = req.body;

  return await changePasswordSchema
    .noUnknown(true)
    .strict(true)
    .validate({ ...payload, country, language, user_id })
    .then(changeUserPassword)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/:id", async (req, res, next) => {
  /**
   * #route   GET /user/v1/user/:id
   * #desc    Get user data by ID (Internal use only)
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const { id } = req.params;

  return await getUserByIdSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, user_id: id })
    .then(getSharedUserData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router
  .route("/notification-preferences")
  .get(securedRoute, async (req, res, next) => {
    /**
     * #route   GET /user/v1/user/notification-preferences
     * #desc    Get user's notification preferences
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");
    const notification_preference_id = req.user.notification_preference_id;

    return await getNotificationPreferencesSchema
      .noUnknown(true)
      .strict(true)
      .validate({ country, language, notification_preference_id })
      .then(getNotificationPreferences)
      .then((result) => res.status(200).send(result))
      .catch(next);
  })
  .put(securedRoute, async (req, res, next) => {
    /**
     * #route   PUT /user/v1/user/notification-preferences
     * #desc    Update user's notification preferences
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");

    const notification_preference_id = req.user.notification_preference_id;
    const payload = req.body;

    return await updateNotificationPreferencesSchema
      .noUnknown(true)
      .strict(true)
      .validate({ ...payload, country, language, notification_preference_id })
      .then(updateNotificationPreferences)
      .then((result) => res.status(200).send(result))
      .catch(next);
  });

router
  .route("/consultation/twilio-token")
  .get(securedRoute, async (req, res, next) => {
    /**
     * #route   GET /user/v1/user/consultation/twilio-token
     * #desc    Get client/provider twilio token
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");

    const user_id = req.user.user_id;
    const consultationId = req.query.consultationId;

    return await getTwilioTokenSchema
      .noUnknown(true)
      .strict(true)
      .validate({ country, language, user_id, consultationId })
      .then(getTwilioToken)
      .then((result) => res.status(200).send(result))
      .catch(next);
  });

router.route("/add-contact-form").post(async (req, res, next) => {
  /**
   * #route   POST /user/v1/user/add-contact-form
   * #desc    Add contact form
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const payload = req.body;

  return await addContactFormSchema
    .noUnknown(true)
    .strict(true)
    .validate({ ...payload, country, language })
    .then(addContactForm)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
