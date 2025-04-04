import pool from "../config/db.js";

// Batching system for Postgres updates
const updateQueue = new Map(); // Map of noteId -> latest snapshot data
let queueSize = 0;
const BATCH_SIZE = 5; // Process after this many operations
const FLUSH_INTERVAL = 3000; // Or process every 5 seconds

// Function to process the queue
const processUpdateQueue = async () => {
  if (updateQueue.size === 0) return;

  console.log(`Processing batch update queue with ${updateQueue.size} note(s)`);

  const promises = [];

  // Process each queued note update
  for (const [id, data] of updateQueue.entries()) {
    const { content, username, updated_by } = data;

    const promise = pool
      .query(
        "UPDATE notes SET content = $1, username = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
        [content, username, updated_by, id]
      )
      .then(() => {
        console.log(`Batch synced changes for note ${id}`);
      })
      .catch((error) => {
        console.error(`Failed to sync note ${id} in batch:`, error);
      });

    promises.push(promise);
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error("Error in batch processing:", error);
  }

  // Clear the queue
  updateQueue.clear();
  queueSize = 0;
};

// Initialize batch processing
const initBatchProcessing = () => {
  // Set up interval to process queue regularly
  const flushInterval = setInterval(processUpdateQueue, FLUSH_INTERVAL);

  // Ensure we process any remaining updates on server shutdown
  process.on("SIGTERM", async () => {
    clearInterval(flushInterval);
    await processUpdateQueue();
  });

  process.on("SIGINT", async () => {
    clearInterval(flushInterval);
    await processUpdateQueue();
  });

  return flushInterval;
};

// Queue an update
const queueUpdate = (id, data) => {
  updateQueue.set(id, data);
  queueSize++;

  // If we've reached batch size, process the queue
  if (queueSize >= BATCH_SIZE) {
    processUpdateQueue();
  }
};

export { initBatchProcessing, processUpdateQueue, queueUpdate };
