-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to check if notes table is empty
DO $$ 
BEGIN
    IF (SELECT COUNT(*) FROM notes) = 0 THEN
        -- Insert sample notes
        INSERT INTO notes (username, content) VALUES
            ('Alice', 'Book recommendations:

📚 "The Psychology of Money" by Morgan Housel
📚 "Atomic Habits" by James Clear
📚 "Deep Work" by Cal Newport

Need to start with Atomic Habits first!'),
            ('Bob', 'Call mom tomorrow to wish her a happy birthday and ask her about the family reunion'),
            ('Charlie', 'Finish the project presentation'),
            ('David', 'Schedule dentist appointment'),
            ('Eve', 'Pay the electricity bill'),
            ('Alice', 'Plan weekend trip to the mountains'),
            ('Bob', 'Review meeting notes from last week'),
            ('Charlie', 'Submit expense report for the trip'),
            ('David', 'Update portfolio website with new projects'),
            ('Eve', 'Start learning React Native');
    END IF;
END $$; 