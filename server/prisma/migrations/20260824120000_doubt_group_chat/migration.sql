-- Migration: Convert doubt conversations from per-student to per-group (teacher-subject-class)

-- Only drop studentId if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doubt_conversations' AND column_name = 'studentId'
  ) THEN
    ALTER TABLE doubt_conversations ALTER COLUMN "studentId" DROP NOT NULL;
    ALTER TABLE doubt_conversations DROP COLUMN "studentId";
  END IF;
END $$;

-- Add unique constraint: one group per teacher-subject-class
ALTER TABLE doubt_conversations DROP CONSTRAINT IF EXISTS doubt_conversations_studentId_teacherId_subjectId_classId_key;
ALTER TABLE doubt_conversations DROP CONSTRAINT IF EXISTS doubt_conversations_teacherId_subjectId_classId_key;
ALTER TABLE doubt_conversations ADD CONSTRAINT doubt_conversations_teacherId_subjectId_classId_key UNIQUE ("teacherId", "subjectId", "classId");
