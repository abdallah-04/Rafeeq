BEGIN;

WITH ranked_items AS (
    SELECT
        ti.id,
        ti.tree_id,
        ti.item_id,
        lower(ti.item_type) AS item_type,
        row_number() OVER (
            PARTITION BY ti.tree_id
            ORDER BY ti.order_num ASC NULLS LAST, ti.group_number ASC NULLS LAST, ti.id ASC
        ) AS step_rank
    FROM public.tree_items ti
    JOIN public.learning_trees lt ON lt.id = ti.tree_id
    WHERE lt.status IN ('active', 'completed')
    -- To reset one child only, uncomment and set the child id:
    -- AND lt.child_id = '00000000-0000-0000-0000-000000000402'::uuid
),
reset_tree_items AS (
    UPDATE public.tree_items ti
    SET
        status = 'pending',
        is_completed = false,
        is_locked = (ri.step_rank <> 1),
        completed_at = NULL,
        earned_points = 0
    FROM ranked_items ri
    WHERE ti.id = ri.id
    RETURNING ti.tree_id, ti.item_id, ri.item_type
),
reset_activities AS (
    UPDATE public.activities a
    SET
        status = 'pending',
        completed_at = NULL
    FROM reset_tree_items r
    WHERE r.item_type = 'activity'
      AND a.id = r.item_id
    RETURNING a.id
),
reset_homeworks AS (
    UPDATE public.homeworks h
    SET
        status = 'pending',
        submitted_at = NULL,
        approved_at = NULL,
        grade = NULL
    FROM reset_tree_items r
    WHERE r.item_type = 'homework'
      AND h.id = r.item_id
    RETURNING h.id
),
reset_quizzes AS (
    UPDATE public.quizzes q
    SET
        status = 'pending',
        completed_at = NULL,
        score = NULL
    FROM reset_tree_items r
    WHERE r.item_type IN ('quiz', 'final_quiz')
      AND q.id = r.item_id
    RETURNING q.id
),
reset_trees AS (
    UPDATE public.learning_trees lt
    SET status = 'active'
    WHERE lt.id IN (SELECT tree_id FROM ranked_items)
    RETURNING lt.id
)
SELECT
    (SELECT count(*) FROM reset_trees) AS learning_trees_reset,
    (SELECT count(*) FROM reset_tree_items) AS tree_items_reset,
    (SELECT count(*) FROM reset_activities) AS activities_reset,
    (SELECT count(*) FROM reset_homeworks) AS homeworks_reset,
    (SELECT count(*) FROM reset_quizzes) AS quizzes_reset;

COMMIT;
