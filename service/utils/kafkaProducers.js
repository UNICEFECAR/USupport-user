import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "userAPI",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();

export const produceSendEmail = async ({
  emailType,
  language,
  recipientUserId,
  recipientEmail,
  emailArgs,
}) => {
  const payload = JSON.stringify({
    emailType,
    language,
    recipientUserId,
    recipientEmail,
    emailArgs,
  });

  await producer.connect();
  await producer.send({
    topic: "send-email",
    messages: [{ value: payload }],
  });
};
