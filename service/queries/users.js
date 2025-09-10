import { getDBPool } from "#utils/dbConfig";

export const getProviderPasswordByEmailQuery = async (poolcountry, email) => {
  return await getDBPool("piiDb", poolcountry).query(
    `
        SELECT password, "user".user_id, type
        FROM "user"
          JOIN provider_detail ON provider_detail.provider_detail_id = "user".provider_detail_id
        WHERE email = $1
        AND deleted_at IS NULL
        LIMIT 1;
        `,
    [email]
  );
};

export const getClientUserByEmailOrAccessToken = async (
  poolCountry,
  email,
  accessToken
) =>
  await getDBPool("piiDb", poolCountry).query(
    `
    WITH clientData AS (

        SELECT * 
        FROM client_detail
        WHERE ($1::VARCHAR IS NULL OR email = $1) 
          AND ($2::VARCHAR IS NULL OR access_token = $2)
        ORDER BY created_at DESC
        LIMIT 1

    ), fullUserData AS (

        SELECT * 
        FROM "user"
          JOIN clientData ON clientData.client_detail_id = "user".client_detail_id
        WHERE deleted_at IS NULL
        ORDER BY "user".created_at DESC
        LIMIT 1

    )

    SELECT * FROM fullUserData; 
    `,
    [email, accessToken]
  );

export const getProviderUserByEmail = async (poolCountry, email) =>
  await getDBPool("piiDb", poolCountry).query(
    `
    WITH providerData AS (

        SELECT * 
        FROM provider_detail
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1

    ), fullUserData AS (

        SELECT * 
        FROM "user"
          JOIN providerData ON providerData.provider_detail_id = "user".provider_detail_id
        ORDER BY "user".created_at DESC
        LIMIT 1

    )

    SELECT * FROM fullUserData; 
    `,
    [email]
  );

export const getUserByID = async (poolCountry, user_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT user_id, country_id, type, client_detail_id, notification_preference_id, password
        FROM "user"
        WHERE user_id = $1
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
        
    `,
    [user_id]
  );

export const createUser = async ({
  poolCountry,
  countryID,
  hashedPass,
  clientData,
  providerData,
  language,
}) => {
  if (clientData) {
    return await getDBPool("piiDb", poolCountry).query(
      `
        WITH newClientDetails AS (

            INSERT INTO client_detail (name, surname, nickname, email, image, sex, year_of_birth, access_token)
            VALUES ($3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING * 

        ), newNotificationPreferences AS (

            INSERT INTO notification_preference DEFAULT VALUES
            RETURNING * 

        ), newUser AS (

            INSERT INTO "user" (country_id, type, client_detail_id, password, notification_preference_id, language)
              SELECT $1, 'client', client_detail_id, 
                      $2, (SELECT notification_preference_id FROM newNotificationPreferences), $11
              FROM newClientDetails
            RETURNING * 

        )

        SELECT * 
        FROM newUser 
            JOIN newClientDetails 
            ON newUser.client_detail_id = newClientDetails.client_detail_id;

        `,
      [
        countryID,
        hashedPass,
        clientData.name,
        clientData.surname,
        clientData.nickname,
        clientData.email,
        clientData.image ? clientData.image : "default",
        clientData.sex,
        clientData.yearOfBirth,
        clientData.userAccessToken,
        language,
      ]
    );
  } else {
    return await getDBPool("piiDb", poolCountry).query(
      `
        WITH newProviderDetails AS (

            INSERT INTO provider_detail (name, patronym, surname, nickname, email,
                                        phone, image, specializations, street, city, postcode, education, sex, consultation_price, description, video_link)
            VALUES ($3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING * 

        ), newNotificationPreferences AS (

            INSERT INTO notification_preference DEFAULT VALUES
            RETURNING * 

        ), newUser AS (

          INSERT INTO "user" (country_id, type, provider_detail_id, password, notification_preference_id, language)
              SELECT $1, 'provider', provider_detail_id, 
                      $2, (SELECT notification_preference_id FROM newNotificationPreferences), $19
              FROM newProviderDetails
            RETURNING * 

        )

        SELECT * 
        FROM newUser 
          JOIN newProviderDetails 
          ON newUser.provider_detail_id = newProviderDetails.provider_detail_id;
        `,
      [
        countryID,
        hashedPass,
        providerData.name,
        providerData.patronym,
        providerData.surname,
        providerData.nickname,
        providerData.email,
        providerData.phone,
        providerData.image ? providerData.image : "default",
        providerData.specializations,
        providerData.street,
        providerData.city,
        providerData.postcode,
        providerData.education,
        providerData.sex,
        providerData.consultationPrice,
        providerData.description,
        providerData.videoLink,
        language,
      ]
    );
  }
};

export const createProviderDetailWorkWithLink = async ({
  poolCountry,
  providerDetailId,
  workWithId,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        INSERT INTO provider_detail_work_with_links (provider_detail_id, work_with_id)
        VALUES ($1, $2)
        RETURNING *;
    `,
    [providerDetailId, workWithId]
  );

export const createProviderDetailLanguageLink = async ({
  poolCountry,
  providerDetailId,
  languageId,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        INSERT INTO provider_detail_language_links (provider_detail_id, language_id)
        VALUES ($1, $2)
        RETURNING *;
    `,
    [providerDetailId, languageId]
  );

export const loginAttempt = async ({
  poolCountry,
  user_id,
  ip_address,
  location,
  status,
  startCooldown = false,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO login_attempt (user_id, ip_address, location, status, start_cooldown)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [user_id, ip_address, location, status, startCooldown]
  );

export const updateUserPassword = async ({ poolCountry, password, user_id }) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE "user"
        SET password = $1
        WHERE user_id = $2
        
    `,
    [password, user_id]
  );

export const getNotificationPreferencesQuery = async (
  poolCountry,
  notification_preferences_id
) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT email, consultation_reminder, consultation_reminder_min, in_platform, push
        FROM "notification_preference"
        WHERE notification_preference_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
        
    `,
    [notification_preferences_id]
  );

export const updateNotificationPreferencesQuery = async ({
  poolCountry,
  notification_preference_id,
  email,
  consultationReminder,
  consultationReminderMin,
  inPlatform,
  push,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE "notification_preference"
        SET email = $1,
            consultation_reminder = $2,
            consultation_reminder_min = $3,
            in_platform = $4,
            push = $5
        WHERE notification_preference_id = $6
        RETURNING *;
        
    `,
    [
      email,
      consultationReminder,
      consultationReminderMin,
      inPlatform,
      push,
      notification_preference_id,
    ]
  );

export const addContactFormQuery = async ({
  poolCountry,
  email,
  subject,
  message,
  sentFrom,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO contact_form (email, subject, message, sent_from)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [email, subject, message, sentFrom]
  );

export const changeUserLanguageQuery = async ({
  poolCountry,
  user_id,
  language,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE "user"
        SET language = $1
        WHERE user_id = $2
        RETURNING *;
      `,
    [language, user_id]
  );

export const addPlatformAccessQuery = async ({
  poolCountry,
  userId,
  platform,
  ipAddress,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
          INSERT INTO platform_access (user_id, platform, ip_address)
          VALUES ($1, $2, $3)
          RETURNING *;
        `,
    [userId ? userId : null, platform, ipAddress]
  );

export const assignOrganizationsToProviderQuery = async ({
  organizationIds,
  providerDetailId,
  poolCountry,
}) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
            WITH organization_ids AS (
              SELECT UNNEST($1::UUID[]) AS organization_id
            ),
            existing_links AS (
              SELECT organization_id, provider_detail_id
              FROM organization_provider_links
              WHERE provider_detail_id = $2
            )
            INSERT INTO organization_provider_links (organization_id, provider_detail_id)
            SELECT organization_ids.organization_id, $2
            FROM organization_ids
            LEFT JOIN existing_links
            ON organization_ids.organization_id = existing_links.organization_id
            WHERE existing_links.organization_id IS NULL
            RETURNING *;
          `,
    [organizationIds, providerDetailId]
  );
};

export const getContentRatingsQuery = async (userId) => {
  return await getDBPool("masterDb").query(
    `
      SELECT content_type, content_id, positive
      FROM content_rating
      WHERE user_id = $1
    `,
    [userId]
  );
};

export const addContentRatingQuery = async ({
  userId,
  contentId,
  contentType,
  positive,
}) => {
  return await getDBPool("masterDb").query(
    `
      INSERT INTO content_rating (user_id, content_type, content_id, positive)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, content_type, content_id)
      DO UPDATE SET positive = EXCLUDED.positive, created_at = now();
    `,
    [userId, contentType, contentId, positive]
  );
};

export const getRatingsForContentQuery = async ({ contentId, contentType }) => {
  return await getDBPool("masterDb").query(
    `
      SELECT *
      FROM content_rating
      WHERE content_id = $1 AND content_type = $2
    `,
    [contentId, contentType]
  );
};

export const removeContentRatingQuery = async ({
  userId,
  contentId,
  contentType,
}) => {
  return await getDBPool("masterDb").query(
    `
      DELETE FROM content_rating
      WHERE user_id = $1 AND content_id = $2 AND content_type = $3
    `,
    [userId, contentId, contentType]
  );
};
