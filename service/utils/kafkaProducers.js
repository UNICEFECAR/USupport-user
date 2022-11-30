import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "userAPI",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();

export const produceRaiseNotification = async ({
  channels,
  emailArgs,
  inPlatformArgs,
  pushArgs,
  language,
}) => {
  const payload = JSON.stringify({
    channels,
    emailArgs,
    inPlatformArgs,
    pushArgs,
    language,
  });

  await producer.connect();
  await producer.send({
    topic: "send-notification",
    messages: [{ value: payload }],
  });
};
