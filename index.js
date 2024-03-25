import Bull from "bull";
import IORedis from "ioredis";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("Waiting 5 seconds to give the Redis cluster a moment :P");
await sleep(5_000);

const queue = new Bull("test-queue", {
  prefix: "{bull}",
  createClient: (clientType) => {
    console.log("Creating Redis client", clientType);
    return new IORedis.Cluster(["redis://redis-cluster:30000"], {
      redisOptions: { enableReadyCheck: false },
    });
  },
});

queue.process("*", async (job) => {
  console.log("Received a job with data", job.data);
  await sleep(10);
  await queue.add({ foo: "bar" });
});
await queue.isReady();
console.log("Processing jobs now");

await queue.add({ foo: "initial bar" });

while (true) {
  await sleep(100);
  await queue.pause(true);
  console.log("Queue paused");

  await sleep(100);
  await queue.resume(true);
  console.log("Queue resumed");
}
