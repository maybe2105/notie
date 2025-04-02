-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Function to check if notes table is empty
DO $$ 
BEGIN
    IF (SELECT COUNT(*) FROM notes) = 0 THEN
        -- Insert sample notes
        INSERT INTO notes (username, content, updated_by) VALUES
            ('Alice', 'Book recommendations:

📚 "The Psychology of Money" by Morgan Housel
📚 "Atomic Habits" by James Clear
📚 "Deep Work" by Cal Newport

Need to start with Atomic Habits first!', 'Alice'),
            ('Bob', 'Call mom tomorrow to wish her a happy birthday and ask her about the family reunion', 'Bob'),
            ('Charlie', 'Finish the project presentation', 'Charlie'),
            ('David', 'Schedule dentist appointment', 'David'),
            ('Eve', 'Pay the electricity bill', 'Eve'),
            ('Alice', 'Plan weekend trip to the mountains', 'Alice'),
            ('Bob', 'Review meeting notes from last week', 'Bob'),
            ('Charlie', 'Submit expense report for the trip', 'Charlie'),
            ('David', 'Update portfolio website with new projects', 'David'),
            ('Eve', 'Start learning React Native', 'Eve');
    END IF;
END $$; 

-- ShareDB tables with latest schema (v5.0.0)
CREATE TABLE IF NOT EXISTS ops (
  collection character varying(255) not null,
  doc_id character varying(255) not null,
  version integer not null,
  operation jsonb not null, -- {v:0, create:{...}} or {v:n, op:[...]}
  PRIMARY KEY (collection, doc_id, version)
);

CREATE TABLE IF NOT EXISTS snapshots (
  collection character varying(255) not null,
  doc_id character varying(255) not null,
  doc_type character varying(255),
  version integer not null,
  data jsonb,
  metadata jsonb,
  PRIMARY KEY (collection, doc_id)
);

CREATE INDEX IF NOT EXISTS snapshots_version ON snapshots (collection, doc_id); 