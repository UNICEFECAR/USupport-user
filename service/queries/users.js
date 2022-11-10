import { getDBPool } from "#utils/dbConfig";

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
        ORDER BY created_at DESC
        LIMIT 1

    ), 

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

            INSERT INTO "user" (country_id, type, client_detail_id, password, notification_preference_id)
              SELECT $1, 'client', client_detail_id, 
                      $2, (SELECT notification_preference_id FROM newNotificationPreferences)
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
        clientData.image,
        clientData.sex,
        clientData.yearOfBirth,
        clientData.userAccessToken,
      ]
    );
  } else {
    return await getDBPool("piiDb", poolCountry).query(
      `
        WITH newProviderDetails AS (

            INSERT INTO client_detail (name, surname, patronym, nickname, email, phone_prefix, 
                                        phone, image, address, video, education, sex, consultation_price, description)
            VALUES ($3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING * 

        ), newNotificationPreferences AS (

            INSERT INTO notification_preference DEFAULT VALUES
            RETURNING * 

        ), newUser AS (

          INSERT INTO "user" (country_id, type, client_detail_id, password, notification_preference_id)
              SELECT $1, 'provider', client_detail_id, 
                      $2, (SELECT notification_preference_id FROM newNotificationPreferences)
              FROM newClientDetails
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
        providerData.surname,
        providerData.patronym,
        providerData.nickname,
        providerData.email,
        providerData.phonePrefix,
        providerData.phone,
        providerData.image,
        providerData.address,
        providerData.video,
        providerData.education,
        providerData.sex,
        providerData.consultationPrice,
        providerData.description,
      ]
    );
  }
};

export const loginAttempt = async ({
  poolCountry,
  user_id,
  ip_address,
  location,
  status,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      INSERT INTO login_attempt (user_id, ip_address, location, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [user_id, ip_address, location, status]
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
