-- Safe local migration for merging backend.zip + RafeeqDB1 into the current Rafeeq DB.
-- Target DB: rafeeq on localhost:5433
-- This script is intentionally additive/idempotent and avoids dropping existing tables/data.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.subjects (
    id integer PRIMARY KEY,
    name_ar character varying(255),
    name_en character varying(255),
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id integer NOT NULL REFERENCES public.subjects(id),
    level integer NOT NULL,
    name_ar character varying(255),
    name_en character varying(255),
    order_num integer,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.activities
    ALTER COLUMN title DROP NOT NULL,
    ALTER COLUMN description DROP NOT NULL;

ALTER TABLE public.homeworks
    ALTER COLUMN teacher_id DROP NOT NULL;

ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS title_ar character varying(255);
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS title_en character varying(255);
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS activity_task_ar text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS activity_task_en text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS parent_guide_ar text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS parent_guide_en text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS group_number integer;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS order_num integer;

ALTER TABLE public.chatbot_sessions ADD COLUMN IF NOT EXISTS child_id uuid;

ALTER TABLE public.homeworks ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.homeworks ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.homeworks ADD COLUMN IF NOT EXISTS order_num integer;
ALTER TABLE public.homeworks ADD COLUMN IF NOT EXISTS group_number integer;

ALTER TABLE public.learning_trees ADD COLUMN IF NOT EXISTS topic_id uuid;

ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS question_ar text;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS question_en text;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS option_1_ar text;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS option_2_ar text;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS option_3_ar text;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS option_4_ar text;

ALTER TABLE public.tree_items ADD COLUMN IF NOT EXISTS is_locked boolean;
ALTER TABLE public.tree_items ADD COLUMN IF NOT EXISTS is_completed boolean;
ALTER TABLE public.tree_items ADD COLUMN IF NOT EXISTS group_number integer;
ALTER TABLE public.tree_items ADD COLUMN IF NOT EXISTS item_type character varying(50);

ALTER TABLE public.tree_items ALTER COLUMN is_locked SET DEFAULT true;
ALTER TABLE public.tree_items ALTER COLUMN is_completed SET DEFAULT false;
ALTER TABLE public.tree_items ALTER COLUMN earned_points SET DEFAULT 0;

UPDATE public.activities
SET
    title_ar = COALESCE(title_ar, title),
    title_en = COALESCE(title_en, title),
    description_ar = COALESCE(description_ar, description),
    description_en = COALESCE(description_en, description);

UPDATE public.homeworks
SET
    description_ar = COALESCE(description_ar, feedback_ar),
    description_en = COALESCE(description_en, feedback_en);

UPDATE public.quiz_questions
SET
    question_en = COALESCE(question_en, question);

UPDATE public.tree_items
SET
    is_locked = COALESCE(is_locked, CASE WHEN COALESCE(order_num, 1) = 1 THEN false ELSE true END),
    is_completed = COALESCE(is_completed, CASE WHEN status = 'completed' THEN true ELSE false END),
    item_type = COALESCE(item_type, CASE content_type_id
        WHEN 1 THEN 'homework'
        WHEN 2 THEN 'quiz'
        WHEN 3 THEN 'activity'
        ELSE 'item'
    END),
    earned_points = COALESCE(earned_points, 0);

INSERT INTO public.content_types (id, name, name_ar, name_en)
VALUES
    (1, 'homework', 'homework', 'homework'),
    (2, 'quiz', 'quiz', 'quiz'),
    (3, 'activity', 'activity', 'activity')
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en;

INSERT INTO public.subjects (id, name_ar, name_en)
VALUES (1, 'الرياضيات', 'Math')
ON CONFLICT (id) DO UPDATE
SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en;

INSERT INTO public.topics (id, subject_id, level, name_ar, name_en, order_num)
VALUES
    ('f88bf1e5-654f-4663-b05e-bea80f091d14', 1, 1, 'الأرقام ١ - ١٠', 'Numbers 1-10', 1),
    ('bd115761-5d40-46c2-8f99-bdcdc18aacd7', 1, 2, 'الأرقام ١١ - ٣٠', 'Numbers 11-30', 2),
    ('eaf3782d-7298-40b1-bf02-494aed77f9aa', 1, 3, 'الجمع البسيط', 'Simple Addition', 3),
    ('fe910d79-172f-4005-ab6b-62007cf50a68', 1, 4, 'الطرح البسيط', 'Simple Subtraction', 4),
    ('ea7fa2de-0a73-4510-aba7-acc427c425f0', 1, 5, 'الأشكال والأنماط', 'Shapes & Patterns', 5)
ON CONFLICT (id) DO UPDATE
SET
    subject_id = EXCLUDED.subject_id,
    level = EXCLUDED.level,
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    order_num = EXCLUDED.order_num;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_chatbot_sessions_child'
    ) THEN
        ALTER TABLE public.chatbot_sessions
            ADD CONSTRAINT fk_chatbot_sessions_child
            FOREIGN KEY (child_id) REFERENCES public.child_profiles(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_learning_trees_topic'
    ) THEN
        ALTER TABLE public.learning_trees
            ADD CONSTRAINT fk_learning_trees_topic
            FOREIGN KEY (topic_id) REFERENCES public.topics(id);
    END IF;
END $$;

UPDATE public.parents p
SET
    full_name_ar = 'ماهر قوارير',
    full_name_en = 'Maher Qawareer'
FROM public.users u
WHERE p.user_id = u.id
  AND u.national_id = '4444444444';

UPDATE public.child_profiles cp
SET
    full_name_ar = 'أيوب ماهر',
    full_name_en = 'Ayoub Maher'
FROM public.users u
WHERE cp.user_id = u.id
  AND u.national_id = '3333333333';

UPDATE public.child_profiles cp
SET parent_id = p.id
FROM public.parents p
JOIN public.users parent_user ON parent_user.id = p.user_id
JOIN public.users child_user ON child_user.national_id = '3333333333'
WHERE cp.user_id = child_user.id
  AND parent_user.national_id = '4444444444';

UPDATE public.child_profiles cp
SET teacher_id = t.id
FROM public.teachers t
JOIN public.users teacher_user ON teacher_user.id = t.user_id
JOIN public.users child_user ON child_user.national_id = '3333333333'
WHERE cp.user_id = child_user.id
  AND teacher_user.national_id = '2222222222';

COMMIT;
