-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

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

-- Run the seed data script
-- seed.sql - Add 100 random notes for testing virtual scrolling

-- Function to add 100 random notes if not already present
DO $$ 
BEGIN
    -- Check if we need to add more test data
        -- Add 100 random notes with different users and content
        INSERT INTO notes (username, content, updated_by) VALUES
            -- Notes for Alice (20)
            ('Alice', 'Shopping list: milk, eggs, bread, cheese, vegetables', 'Alice'),
            ('Alice', 'Meeting with marketing team at 2pm', 'Alice'),
            ('Alice', 'Call plumber to fix the sink leak', 'Alice'),
            ('Alice', 'Finish reading chapter 5 of "Clean Code"', 'Alice'),
            ('Alice', 'Look up recipes for dinner party on Saturday', 'Alice'),
            ('Alice', 'Meditation practice - 15 minutes in the morning', 'Alice'),
            ('Alice', 'Research vacation spots for summer trip', 'Alice'),
            ('Alice', 'Renew gym membership', 'Alice'),
            ('Alice', 'Buy birthday gift for dad', 'Alice'),
            ('Alice', 'Sign up for online course on web development', 'Alice'),
            ('Alice', 'Schedule annual health checkup', 'Alice'),
            ('Alice', 'Pay rent by Friday', 'Alice'),
            ('Alice', 'Try new restaurant downtown with friends', 'Alice'),
            ('Alice', 'Watch documentary on climate change', 'Alice'),
            ('Alice', 'Prepare presentation for client meeting', 'Alice'),
            ('Alice', 'Get car serviced - oil change and tire rotation', 'Alice'),
            ('Alice', 'Look into investing options', 'Alice'),
            ('Alice', 'Set up automatic bill payments for utilities', 'Alice'),
            ('Alice', 'Clean out closet and donate old clothes', 'Alice'),
            ('Alice', 'Research local volunteer opportunities', 'Alice'),

            -- Notes for Bob (20)
            ('Bob', 'Debug the authentication module in the app', 'Bob'),
            ('Bob', 'Research GraphQL implementation for the project', 'Bob'),
            ('Bob', 'Plan team building activity for next month', 'Bob'),
            ('Bob', 'Review pull requests from junior developers', 'Bob'),
            ('Bob', 'Update resume with recent projects', 'Bob'),
            ('Bob', 'Fix bicycle brakes before weekend ride', 'Bob'),
            ('Bob', 'Call insurance company about claim', 'Bob'),
            ('Bob', 'Schedule dog for annual vet checkup', 'Bob'),
            ('Bob', 'Plan camping trip for Memorial Day weekend', 'Bob'),
            ('Bob', 'Research mechanical keyboards', 'Bob'),
            ('Bob', 'Renew passport - expires in 3 months', 'Bob'),
            ('Bob', 'Look up how to fix leaky faucet in bathroom', 'Bob'),
            ('Bob', 'Finish online JavaScript advanced course', 'Bob'),
            ('Bob', 'Check air filter in HVAC system', 'Bob'),
            ('Bob', 'Send thank you note to interview panel', 'Bob'),
            ('Bob', 'Return library books by Wednesday', 'Bob'),
            ('Bob', 'Buy new running shoes', 'Bob'),
            ('Bob', 'Update home office setup with ergonomic chair', 'Bob'),
            ('Bob', 'Look into solar panel installation quotes', 'Bob'),
            ('Bob', 'Meal prep ideas for next week', 'Bob'),

            -- Notes for Charlie (20)
            ('Charlie', 'Analyze Q1 sales data for team meeting', 'Charlie'),
            ('Charlie', 'Organize digital photo collection', 'Charlie'),
            ('Charlie', 'Research machine learning frameworks for new project', 'Charlie'),
            ('Charlie', 'Schedule dentist appointment for teeth cleaning', 'Charlie'),
            ('Charlie', 'Find recipe for gluten-free lasagna', 'Charlie'),
            ('Charlie', 'Renew driver license - expires next month', 'Charlie'),
            ('Charlie', 'Plant herbs in garden - basil, rosemary, thyme', 'Charlie'),
            ('Charlie', 'Call mom to check on her recovery', 'Charlie'),
            ('Charlie', 'Fix squeaky door hinges in bedroom', 'Charlie'),
            ('Charlie', 'Set up automatic retirement contributions', 'Charlie'),
            ('Charlie', 'Find local pottery class to attend', 'Charlie'),
            ('Charlie', 'Research phone upgrade options', 'Charlie'),
            ('Charlie', 'Schedule haircut for next week', 'Charlie'),
            ('Charlie', 'Backup important files to external drive', 'Charlie'),
            ('Charlie', 'Finish watching tutorial series on Docker', 'Charlie'),
            ('Charlie', 'Book hotel for conference in September', 'Charlie'),
            ('Charlie', 'Research standing desk options', 'Charlie'),
            ('Charlie', 'Update software on all devices', 'Charlie'),
            ('Charlie', 'Try new coffee shop that opened downtown', 'Charlie'),
            ('Charlie', 'Schedule car inspection before registration renewal', 'Charlie'),

            -- Notes for David (20)
            ('David', 'Finalize budget proposal for Q3', 'David'),
            ('David', 'Look into home security systems', 'David'),
            ('David', 'Research electric vehicles for next car purchase', 'David'),
            ('David', 'Check soil pH levels in garden', 'David'),
            ('David', 'Send birthday card to aunt', 'David'),
            ('David', 'Finish painting guest bedroom', 'David'),
            ('David', 'Update emergency contact information at work', 'David'),
            ('David', 'Set up new wireless router', 'David'),
            ('David', 'Research local CSA farm memberships', 'David'),
            ('David', 'Look into noise-cancelling headphones', 'David'),
            ('David', 'Fix leak in garage roof', 'David'),
            ('David', 'Find recipes for meal prep Sunday', 'David'),
            ('David', 'Call contractors for kitchen renovation quotes', 'David'),
            ('David', 'Update beneficiaries on insurance policies', 'David'),
            ('David', 'Review monthly budget and adjust spending', 'David'),
            ('David', 'Research new programming language for personal project', 'David'),
            ('David', 'Plan vegetable garden layout for spring', 'David'),
            ('David', 'Install updates on home computer', 'David'),
            ('David', 'Organize tool shed before weekend projects', 'David'),
            ('David', 'Research podcasts on personal finance', 'David'),

            -- Notes for Eve (20)
            ('Eve', 'Complete certification exam by end of month', 'Eve'),
            ('Eve', 'Research effective home workout routines', 'Eve'),
            ('Eve', 'Draft blog post on recent tech conference', 'Eve'),
            ('Eve', 'Look into community garden plots', 'Eve'),
            ('Eve', 'Update LinkedIn profile with recent achievements', 'Eve'),
            ('Eve', 'Schedule annual eye exam', 'Eve'),
            ('Eve', 'Research local beekeeping classes', 'Eve'),
            ('Eve', 'Fix broken link on personal website', 'Eve'),
            ('Eve', 'Plan birthday surprise for boyfriend', 'Eve'),
            ('Eve', 'Research air purifier options for apartment', 'Eve'),
            ('Eve', 'Schedule oil change for car', 'Eve'),
            ('Eve', 'Renew magazine subscription', 'Eve'),
            ('Eve', 'Try new recipe for sourdough bread', 'Eve'),
            ('Eve', 'Set up recurring donation to favorite charity', 'Eve'),
            ('Eve', 'Research composting methods for apartment', 'Eve'),
            ('Eve', 'Find yoga studio with evening classes', 'Eve'),
            ('Eve', 'Look into language learning apps', 'Eve'),
            ('Eve', 'Research houseplants that are safe for cats', 'Eve'),
            ('Eve', 'Update budget spreadsheet with new expenses', 'Eve'),
            ('Eve', 'Find new hiking trails to explore on weekends', 'Eve');
END $$; 