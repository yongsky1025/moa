-- One-time migration before removing SUPPORT enum.
-- 1) Move SUPPORT posts to global FREE board
-- 2) Delete global SUPPORT boards

START TRANSACTION;

SET @free_board_id := (
  SELECT b.board_id
  FROM board b
  WHERE b.board_type = 'FREE'
    AND b.circle_id IS NULL
  ORDER BY b.board_id
  LIMIT 1
);

UPDATE post p
JOIN board b ON b.board_id = p.board_id
SET p.board_id = @free_board_id
WHERE b.board_type = 'SUPPORT'
  AND b.circle_id IS NULL
  AND @free_board_id IS NOT NULL;

DELETE FROM board
WHERE board_type = 'SUPPORT'
  AND circle_id IS NULL;

COMMIT;
