import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Get all notes (paginated)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Get total count
    const countResult = await pool.query("SELECT COUNT(*) FROM notes");
    const total = parseInt(countResult.rows[0].count);

    // Get paginated notes
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      total,
      notes: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new note
router.post("/", async (req, res) => {
  const { username, content } = req.body;
  try {
    // Insert into the regular notes table first
    const result = await pool.query(
      "INSERT INTO notes (username, content, updated_by) VALUES ($1, $2, $1) RETURNING *",
      [username, content]
    );
    const newNote = result.rows[0];

    // Send response directly after DB insert
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error in POST /notes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /notes/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific note
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error in GET /notes/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, content, updatedBy } = req.body;

  if (!username || !content || !updatedBy) {
    return res
      .status(400)
      .json({ error: "Username, content, and updatedBy are required" });
  }

  try {
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9\s]/g, "");
    // Don't sanitize content to preserve formatting
    const sanitizedUpdatedBy = updatedBy.replace(/[^a-zA-Z0-9\s]/g, "");

    const result = await pool.query(
      "UPDATE notes SET username = $1, content = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [sanitizedUsername, content, sanitizedUpdatedBy, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error in PUT /notes/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
