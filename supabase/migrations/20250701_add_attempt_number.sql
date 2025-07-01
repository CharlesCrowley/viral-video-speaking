-- Add attempt_number to attempts table to track first vs second attempts
ALTER TABLE attempts 
ADD COLUMN attempt_number INTEGER DEFAULT 1 CHECK (attempt_number IN (1, 2));

-- Create index for efficient querying of attempts by user, lesson, and attempt number
CREATE INDEX idx_attempts_user_lesson_attempt 
ON attempts(user_id, lesson_id, attempt_number);

-- Update existing attempts to be attempt_number = 1
UPDATE attempts SET attempt_number = 1 WHERE attempt_number IS NULL;

-- Make attempt_number NOT NULL after updating existing data
ALTER TABLE attempts 
ALTER COLUMN attempt_number SET NOT NULL;