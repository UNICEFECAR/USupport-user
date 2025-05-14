import express from "express";

import {
  getSharedUserData,
  changeUserPassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getTwilioToken,
  addContactForm,
  changeUserLanguage,
  addPlatformAccess,
  getContentRatings,
  addContentRating,
  getRatingsForContent,
  generatePdf,
} from "#controllers/users";

import { securedRoute } from "#middlewares/auth";
import {
  getUserByIdSchema,
  changePasswordSchema,
  getNotificationPreferencesSchema,
  updateNotificationPreferencesSchema,
  getTwilioTokenSchema,
  addContactFormSchema,
  changeUserLanguageSchema,
  addPlatformAccessSchema,
  addContentRatingSchema,
  getContentRatingsSchema,
  getRatingsForContentSchema,
  generatePdfSchema,
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
    .validate({ country, language, user_id, ...payload })
    .then(changeUserPassword)
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
    const userType = req.header("x-user-type");

    return await getNotificationPreferencesSchema
      .noUnknown(true)
      .strict(true)
      .validate({ country, language, notification_preference_id, userType })
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
      .validate({ country, language, notification_preference_id, ...payload })
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

    const userId = req.user.user_id;

    const consultationId = req.query.consultationId;

    return await getTwilioTokenSchema
      .noUnknown(true)
      .strict(true)
      .validate({ country, language, userId, consultationId })
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
    .validate({ country, language, ...payload })
    .then(addContactForm)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.route("/change-language").put(securedRoute, async (req, res, next) => {
  /**
   * #route   PUT /user/v1/user/change-language
   * #desc    Change user's language
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const user_id = req.user.user_id;

  return await changeUserLanguageSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, user_id })
    .then(changeUserLanguage)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/access-platform", async (req, res, next) => {
  /**
   * #route   GET /user/v1/user/access-platform
   * #desc    Access platform
   */

  const country = req.header("x-country-alpha-2");
  const { platform } = req.query;
  const userId = req.header("x-user-id");

  console.log("x-real-ip", req.header("x-real-ip"));
  console.log("x-forwarded-for", req.header("x-forwarded-for"));
  console.log("remoteAddress", req.connection.remoteAddress);

  const ipAddress =
    req.header("x-real-ip") ||
    req.header("x-forwarded-for") ||
    req.connection.remoteAddress ||
    "0.0.0.0";

  return await addPlatformAccessSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, platform, userId, ipAddress })
    .then(addPlatformAccess)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/content-ratings", async (req, res, next) => {
  /**
   * #route   GET /user/v1/user/content-ratings
   * #desc    Get content ratings
   */
  const language = req.header("x-language-alpha-2");
  const userId = req.header("x-user-id");

  return await getContentRatingsSchema
    .noUnknown(true)
    .strict(true)
    .validate({ language, userId })
    .then(getContentRatings)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/ratings-for-content", async (req, res, next) => {
  /**
   * #route   GET /user/v1/user/rating-for-content
   * #desc    Get rating for content
   */
  const userId = req.header("x-user-id") || null;
  const contentType = req.query.contentType;
  const contentId = Number(req.query.contentId);

  return await getRatingsForContentSchema
    .noUnknown(true)
    .strict(true)
    .validate({ contentType, userId, contentId })
    .then(getRatingsForContent)
    .then((result) => {
      return res.status(200).send(result);
    })
    .catch(next);
});

router.post("/content-rating", async (req, res, next) => {
  /**
   * #route   POST /user/v1/user/content-rating
   * #desc    Add content rating
   */
  const language = req.header("x-language-alpha-2");
  const userId = req.header("x-user-id");
  const payload = req.body;

  return await addContentRatingSchema
    .noUnknown(true)
    .strict(true)
    .validate({ ...payload, language, userId })
    .then(addContentRating)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post("/generate-pdf", async (req, res, next) => {
  /**
   * #route   POST /user/v1/user/generate-pdf
   * #desc    Generate PDF from content URL
   */
  const language = req.header("x-language-alpha-2") || "en";
  const payload = req.body;

  return await generatePdfSchema
    .noUnknown(true)
    .strict(true)
    .validate({ ...payload, language })
    .then(async (validData) => {
      // Generate PDF and pipe directly to response
      const pdfBuffer = await generatePdf(validData);

      // Set headers for PDF file download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${validData.contentType}-${Date.now()}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);
    })
    .catch(next);
});

export { router };
