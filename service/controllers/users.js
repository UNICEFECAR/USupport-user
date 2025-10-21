import bcrypt from "bcryptjs";
import fetch from "node-fetch";
import { PDFDocument, rgb } from "pdf-lib";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as fontkit from "fontkit";

import {
  getUserByID,
  getNotificationPreferencesQuery,
  updateNotificationPreferencesQuery,
  addContactFormQuery,
  changeUserLanguageQuery,
  addPlatformAccessQuery,
  addContentRatingQuery,
  getContentRatingsQuery,
  getRatingsForContentQuery,
  removeContentRatingQuery,
} from "#queries/users";
import {
  userNotFound,
  notificationPreferencesNotFound,
  incorrectPassword,
} from "#utils/errors";
import { updatePassword, videoToken } from "#utils/helperFunctions";
import { t } from "#translations/index";

const TWILIO_CONFIG = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiSid: process.env.TWILIO_API_SID,
    apiSecret: process.env.TWILIO_API_SECRET,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};

export const getSharedUserData = async ({ country, language, user_id }) => {
  return await getUserByID(country, user_id)
    .then((res) => {
      if (res.rowCount === 0) {
        throw userNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const changeUserPassword = async ({
  country,
  language,
  user_id,
  oldPassword,
  newPassword,
}) => {
  const userData = await getSharedUserData({ country, user_id });
  const validatePassword = await bcrypt.compare(oldPassword, userData.password);

  if (!validatePassword) {
    throw incorrectPassword(language);
  }

  await updatePassword({
    poolCountry: country,
    user_id,
    password: newPassword,
  });

  return { success: true };
};

export const getNotificationPreferences = async ({
  country,
  language,
  notification_preference_id,
  userType,
}) => {
  return await getNotificationPreferencesQuery(
    country,
    notification_preference_id
  )
    .then((res) => {
      if (res.rowCount === 0) {
        throw notificationPreferencesNotFound(language);
      } else {
        if (userType !== "provider") {
          return {
            ...res.rows[0],
            consultation_reminder_min: res.rows[0].consultation_reminder_min[0],
          };
        }
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateNotificationPreferences = async ({
  country,
  language,
  notification_preference_id,
  email,
  consultationReminder,
  consultationReminderMin,
  inPlatform,
  push,
}) => {
  const consultationReminderMinArray =
    typeof consultationReminderMin === "number"
      ? [consultationReminderMin]
      : consultationReminderMin;

  return await updateNotificationPreferencesQuery({
    poolCountry: country,
    notification_preference_id,
    email,
    consultationReminder,
    consultationReminderMin: consultationReminderMinArray,
    inPlatform,
    push,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw notificationPreferencesNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const getTwilioToken = async ({ userId, consultationId }) => {
  const token = videoToken(userId, consultationId, TWILIO_CONFIG);

  return { token: token.toJwt() };
};

export const addContactForm = async ({ country, ...payload }) => {
  return await addContactFormQuery({
    poolCountry: country,
    ...payload,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};

export const changeUserLanguage = async ({ country, language, user_id }) => {
  return await changeUserLanguageQuery({
    poolCountry: country,
    user_id,
    language,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};

export const addPlatformAccess = async ({
  country,
  userId,
  platform,
  visitorId,
}) => {
  return await addPlatformAccessQuery({
    poolCountry: country,
    userId,
    platform,
    visitorId: visitorId || userId, // If no visitorId provided, use the userId
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};

export const getContentRatings = async ({ userId }) => {
  return await getContentRatingsQuery(userId).then((res) => {
    if (res.rowCount > 0) {
      return res.rows;
    }
    return [];
  });
};

export const addContentRating = async ({
  userId,
  contentId,
  contentType,
  positive,
}) => {
  if (positive === null) {
    return await removeContentRatingQuery({ userId, contentId, contentType })
      .then(() => {
        return { success: true };
      })
      .catch((err) => {
        throw err;
      });
  }
  return await addContentRatingQuery({
    userId,
    contentId,
    contentType,
    positive,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};

export const getRatingsForContent = async ({
  contentId,
  contentType,
  userId,
}) => {
  return await getRatingsForContentQuery({
    contentId,
    contentType,
  }).then((res) => {
    if (res.rowCount > 0) {
      const { likes, dislikes, isLikedByUser, isDislikedByUser } =
        res.rows.reduce(
          (acc, row) => {
            if (row.positive) {
              acc.likes += 1;
            } else if (row.positive === false) {
              acc.dislikes += 1;
            }
            if (row.user_id === userId) {
              if (row.positive !== null) {
                acc.isLikedByUser = row.positive;
                acc.isDislikedByUser = !row.positive;
              }
            }
            return acc;
          },
          {
            likes: 0,
            dislikes: 0,
            isLikedByUser: false,
            isDislikedByUser: false,
          }
        );
      return {
        likes,
        dislikes,
        isLikedByUser,
        isDislikedByUser,
      };
    }
    return {
      likes: 0,
      dislikes: 0,
      isLikedByUser: false,
      isDislikedByUser: false,
    };
  });
};

export const generatePdf = async ({
  contentUrl,
  contentType,
  title,
  imageUrl,
  language,
}) => {
  try {
    const response = await fetch(contentUrl);
    const contentData = await response.json();

    if (!contentData || !contentData.data) {
      throw new Error("Failed to fetch content data");
    }

    const data = contentData.data;
    const attributes = data.attributes;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const regularFontBytes = fs.readFileSync(
      path.join(__dirname, "fonts", "NotoSans-Regular.ttf")
    );
    const boldFontBytes = fs.readFileSync(
      path.join(__dirname, "fonts", "NotoSans-Bold.ttf")
    );
    const italicFontBytes = fs.readFileSync(
      path.join(__dirname, "fonts", "NotoSans-Italic.ttf")
    );

    // Load fonts
    const font = await pdfDoc.embedFont(regularFontBytes);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);
    const italicFont = await pdfDoc.embedFont(italicFontBytes);

    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Set document title
    const contentTitle = title || attributes.title || `${contentType} content`;
    pdfDoc.setTitle(contentTitle);

    // Margins and positions
    const margin = 50;
    let currentY = height - margin;
    const maxWidth = width - 2 * margin;

    // Write title
    page.drawText(contentTitle, {
      x: margin,
      y: currentY,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentY -= 30;

    // Add creator if available
    const creator = attributes.author || attributes.creator;
    if (creator) {
      page.drawText(t("by", language, [creator]), {
        x: margin,
        y: currentY,
        size: 12,
        font: italicFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 20;
    }

    // Add metadata like reading time, category
    const readingTime = attributes.reading_time || attributes.readingTime;
    if (readingTime) {
      page.drawText(t("reading_time", language, [readingTime]), {
        x: margin,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 20;
    }

    if (attributes.category && attributes.category.data) {
      const categoryName = attributes.category.data.attributes.name;
      page.drawText(t("category", language, [categoryName]), {
        x: margin,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 20;
    }

    // Add labels if available
    if (
      attributes.labels &&
      attributes.labels.data &&
      attributes.labels.data.length > 0
    ) {
      // Draw "Labels:" text
      page.drawText(t("labels", language), {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      currentY -= 20;

      // Format labels as individual tags rather than a comma-separated list
      const labels = attributes.labels.data;
      let xPosition = margin;

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const labelName = label.attributes
          ? label.attributes.Name || label.attributes.name
          : "";

        if (!labelName) continue;

        // Calculate label width to determine if we need to move to next line
        let labelWidth;
        try {
          labelWidth = font.widthOfTextAtSize(labelName, 12) + 20; // Add padding
        } catch (e) {
          labelWidth = 150; // Default width if can't calculate
        }

        // If this label would go beyond page width, move to next line
        if (xPosition + labelWidth > width - margin) {
          xPosition = margin;
          currentY -= 25;
        }

        // Draw label background
        page.drawRectangle({
          x: xPosition,
          y: currentY - 12,
          width: labelWidth,
          height: 20,
          borderColor: rgb(32 / 255, 128 / 255, 158 / 255),
          borderWidth: 1,
          borderRadius: 20,
        });

        // Draw label text
        page.drawText(labelName, {
          x: xPosition + 10,
          y: currentY - 5,
          size: 10,
          font: font,
          color: rgb(102 / 255, 118 / 255, 141 / 255),
        });

        // Update x position for next label
        xPosition += labelWidth + 10;
      }

      // Update y position after all labels
      currentY -= 30;
    }

    // Add horizontal line as separator
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    currentY -= 20;

    // Add image if available - check all possible image locations
    const getImageData = () => {
      // First, try to use provided imageUrl if available
      if (imageUrl) {
        return { url: imageUrl };
      }

      // Check in thumbnail field
      if (attributes.thumbnail && attributes.thumbnail.data) {
        return attributes.thumbnail.data.attributes;
      }

      // Check in image field
      if (attributes.image && attributes.image.data) {
        return attributes.image.data.attributes;
      }

      // Check in formats if available
      if (
        attributes.thumbnail &&
        attributes.thumbnail.data &&
        attributes.thumbnail.data.attributes &&
        attributes.thumbnail.data.attributes.formats
      ) {
        const formats = attributes.thumbnail.data.attributes.formats;

        // Try to get medium size first
        if (formats.medium) {
          return formats.medium;
        }

        // Then small
        if (formats.small) {
          return formats.small;
        }

        // Then thumbnail
        if (formats.thumbnail) {
          return formats.thumbnail;
        }
      }

      return null;
    };

    const imageData = getImageData();
    if (imageData) {
      try {
        // Get the complete image URL, ensuring it's absolute
        let imageUrl = imageData.url;

        // Make sure the URL is absolute
        if (imageUrl.startsWith("/")) {
          // If URL is relative, extract domain from contentUrl
          try {
            const contentUrlObj = new URL(contentUrl);
            imageUrl = `${contentUrlObj.origin}${imageUrl}`;
          } catch (error) {
            console.warn(
              "Could not parse content URL to fix relative image path"
            );
          }
        }

        // Add headers to avoid CORS issues
        const imageResponse = await fetch(imageUrl, {
          headers: {
            Accept: "image/*, */*",
            "User-Agent": "PDF Generator",
            Origin: "https://usupportme-api",
          },
        });

        if (!imageResponse.ok) {
          throw new Error(
            `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`
          );
        }

        const imageArrayBuffer = await imageResponse.arrayBuffer();

        if (!imageArrayBuffer || imageArrayBuffer.byteLength === 0) {
          throw new Error("Empty image data received");
        }

        // Determine image format based on content type or URL extension
        const contentType = imageResponse.headers.get("content-type") || "";
        const isJpeg =
          contentType.includes("jpeg") ||
          contentType.includes("jpg") ||
          imageUrl.endsWith(".jpg") ||
          imageUrl.endsWith(".jpeg");
        const isPng = contentType.includes("png") || imageUrl.endsWith(".png");

        let image;
        try {
          if (isJpeg) {
            image = await pdfDoc.embedJpg(imageArrayBuffer);
          } else if (isPng) {
            image = await pdfDoc.embedPng(imageArrayBuffer);
          } else {
            // Try PNG as default if format couldn't be determined
            try {
              image = await pdfDoc.embedPng(imageArrayBuffer);
            } catch (e) {
              // Fallback to JPEG if PNG embedding fails
              image = await pdfDoc.embedJpg(imageArrayBuffer);
            }
          }

          if (image) {
            // Calculate dimensions to fit within page width while preserving aspect ratio
            const imgWidth = Math.min(maxWidth, image.width);
            const imgHeight = (imgWidth / image.width) * image.height;

            // Add new page if image doesn't fit on current page
            if (currentY - imgHeight < margin) {
              page = pdfDoc.addPage([595.28, 841.89]);
              currentY = height - margin;
            }

            page.drawImage(image, {
              x: margin,
              y: currentY - imgHeight,
              width: imgWidth,
              height: imgHeight,
            });

            currentY -= imgHeight + 20;
          }
        } catch (error) {
          console.error("Error embedding image in PDF:", error.message);
          // Continue without the image
        }
      } catch (error) {
        console.error("Error processing image for PDF:", error.message);
        // Continue without the image
      }
    }

    // Convert markdown body to text for PDF
    if (attributes.body) {
      // Parse markdown to HTML
      const html = marked.parse(attributes.body);

      // Create a DOM to extract text content
      const dom = new JSDOM(html);
      const paragraphs = dom.window.document.querySelectorAll(
        "p, h1, h2, h3, h4, h5, h6, ul, ol"
      );

      for (const paragraph of paragraphs) {
        const originalText = paragraph.textContent.trim();
        if (!originalText) continue;

        let fontSize = 12;
        let fontToUse = font;

        // Detect headers and apply different styling
        if (paragraph.tagName.startsWith("H")) {
          const level = parseInt(paragraph.tagName.substring(1));
          fontSize = 20 - level * 2; // H1: 18, H2: 16, etc.
          fontToUse = boldFont;
        }

        // Process text to handle potential encoding issues
        const text = originalText
          .replace(/[\n\r]/g, " ") // Replace newlines with spaces
          // eslint-disable-next-line no-control-regex
          .replace(/[^\x00-\x7F]/g, (char) => {
            // Replace non-ASCII characters with their closest ASCII equivalents or remove them
            try {
              return char.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
            } catch (e) {
              return "";
            }
          });

        // Split text into lines that fit in the page width
        const words = text.split(" ");
        let line = "";

        for (const word of words) {
          try {
            const testLine = line + (line ? " " : "") + word;

            let testWidth;
            try {
              testWidth = fontToUse.widthOfTextAtSize(testLine, fontSize);
            } catch (error) {
              // If we can't calculate width, assume it's too wide
              testWidth = maxWidth + 1;
            }

            if (testWidth > maxWidth) {
              // Add new page if line doesn't fit on current page
              if (currentY - fontSize < margin) {
                page = pdfDoc.addPage([595.28, 841.89]);
                currentY = height - margin;
              }

              if (line) {
                try {
                  page.drawText(line, {
                    x: margin,
                    y: currentY,
                    size: fontSize,
                    font: fontToUse,
                    color: rgb(0, 0, 0),
                  });
                } catch (error) {
                  console.warn(`Error drawing text: ${error.message}`);
                }
              }

              currentY -= fontSize + 5;
              line = word;
            } else {
              line = testLine;
            }
          } catch (error) {
            console.warn(`Error processing word "${word}": ${error.message}`);
            continue;
          }
        }

        // Draw remaining text
        if (line) {
          // Add new page if line doesn't fit on current page
          if (currentY - fontSize < margin) {
            page = pdfDoc.addPage([595.28, 841.89]);
            currentY = height - margin;
          }

          try {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: fontSize,
              font: fontToUse,
              color: rgb(0, 0, 0),
            });
          } catch (error) {
            console.warn(`Error drawing text: ${error.message}`);
          }

          currentY -= fontSize + 5;
        }

        // Add extra space after paragraphs
        currentY -= 10;
      }
    }

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const getOrganizationKey = async ({ platform }) => {
  const ORGANIZATIONS_KEY = process.env.ORGANIZATIONS_KEY;
  const ORGANIZATIONS_KEY_IOS = process.env.ORGANIZATIONS_KEY_IOS;
  const ORGANIZATIONS_KEY_ANDROID = process.env.ORGANIZATIONS_KEY_ANDROID;

  const ORGANIZATIONS_KEYS = {
    ios: ORGANIZATIONS_KEY_IOS,
    android: ORGANIZATIONS_KEY_ANDROID,
    web: ORGANIZATIONS_KEY,
  };
  console.log("TWILIO_ACCOUNT_SID", process.env.TWILIO_ACCOUNT_SID);
  console.log(ORGANIZATIONS_KEYS);

  const organizationsKey = ORGANIZATIONS_KEYS[platform];

  if (!organizationsKey) {
    throw new Error("Organizations key not configured");
  }

  return {
    organizationsKey,
  };
};
