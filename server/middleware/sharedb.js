import ShareDB from "sharedb";
import SharedbPostgres from "sharedb-postgres";
import { queueUpdate } from "./batchUpdates.js";

// Initialize ShareDB with PostgreSQL adapter
const initShareDB = (dbConfig) => {
  const sharedbPostgres = SharedbPostgres({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  const backend = new ShareDB({ db: sharedbPostgres });

  // Register middleware for syncing to PostgreSQL
  backend.use("afterWrite", function (context, next) {
    try {
      if (!context.op) {
        return next();
      }

      const id = context.id;
      const collection = context.collection;

      // Only queue documents from the notes collection
      if (collection !== "notes") {
        return next();
      }

      // Use the snapshot data directly from the context
      if (context.snapshot && context.snapshot.data) {
        // Add to update queue
        queueUpdate(id, context.snapshot.data);
      }

      // Continue middleware chain without waiting for DB
      next();
    } catch (error) {
      console.error("Error in afterWrite middleware:", error);
      next(error);
    }
  });

  return backend;
};

export default initShareDB;
