import { pool } from "#utils/dbConfig";

export const getClientUserByEmail = async (email) =>
  await pool.query(
    `
    WITH clientData AS (

        SELECT * 
        FROM client_detail
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1;

    ), fullUserData AS (

        SELECT * 
        FROM user
          JOIN clientData ON clientData.client_detail_id = user.client_detail_id
        ORDER BY created_at DESC
        LIMIT 1;

    ), 

    SELECT * FROM fullUserData; 
    `,
    [email]
  );

export const getProviderUserByEmail = async (email) =>
  await pool.query(
    `
    WITH providerData AS (

        SELECT * 
        FROM provider_detail
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1;

    ), fullUserData AS (

        SELECT * 
        FROM user
          JOIN providerData ON providerData.provider_detail_id = user.provider_detail_id
        ORDER BY created_at DESC
        LIMIT 1;

    ), 

    SELECT * FROM fullUserData; 
    `,
    [email]
  );

export const getUserByID = async (user_id) =>
  await pool.query(
    `
        SELECT user_id, country_id, type, client_detail_id, notification_preference_id
        FROM user
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
        
    `,
    [user_id]
  );

export const createUser = async ({
  countryID,
  hashedPass,
  clientData,
  providerData,
}) => {
  if (clientData) {
    return await pool.query(
      `
        WITH newClientDetails AS (

            INSERT INTO client_detail (name, surname, preferred_name, username, email, image, sex, year_of_birth)
            VALUES ($3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING * 

        ), newNotificationPreferences AS (

            INSERT INTO notification_preference DEFAULT VALUES
            RETURNING * 

        ), newUser AS (

            INSERT INTO user (country_id, type, client_detail_id, password, notification_preference_id)
            VALUES ($1, 'client', (SELECT client_detail_id FROM newClientDetails), 
                    $2, (SELECT notification_preference_id FROM newNotificationPreferences))
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
        clientData.preferredName,
        clientData.username,
        clientData.email,
        clientData.image,
        clientData.sex,
        clientData.yob,
      ]
    );
  } else {
    return await pool.query(
      `
        WITH newProviderDetails AS (

            INSERT INTO client_detail (name, surname, patronym, preferredName, username, email, phone_prefix, 
                                        phone, image, address, video, education, sex, consultation_price, description)
            VALUES ($3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING * 

        ), newNotificationPreferences AS (

            INSERT INTO notification_preference DEFAULT VALUES
            RETURNING * 

        ), newUser AS (

            INSERT INTO user (country_id, type, provider_detail_id, password, notification_preference_id)
            VALUES ($1, 'provider', (SELECT provider_detail_id FROM newProviderDetails), 
                    $2, (SELECT notification_preference_id FROM newNotificationPreferences))
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
        providerData.preferredName,
        providerData.username,
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
