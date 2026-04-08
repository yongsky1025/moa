-- ============================================================
-- MOA board/post/reply 더미 재생성 스크립트 (Spring SQL Init 호환)
-- - DELIMITER / PROCEDURE 미사용
-- - set-based INSERT 로 자동 실행 가능
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 0) board/post/reply 관련 기존 데이터 정리
-- ------------------------------------------------------------
DELETE FROM reply_reaction;
DELETE FROM reply;
DELETE FROM post_reaction;
DELETE FROM post_bookmark;
DELETE FROM post_view_log;
DELETE FROM post_search;
DELETE FROM sanction WHERE target_type IN ('POST', 'REPLY');
DELETE FROM report WHERE target_type IN ('POST', 'REPLY');
DELETE FROM likes WHERE target_type IN ('POST', 'REPLY');
DELETE FROM admin_action_log WHERE target_type IN ('POST', 'REPLY');
DELETE FROM admin_action_log
 WHERE method_name IN (
    'seedPostReplyDeletePost',
    'seedPostReplyDeleteReply',
    'seedPostReplyResolveReport',
    'seedPostReplyApplySanction',
    'seedPostReplyCancelSanction'
 );
DELETE FROM post;
DELETE FROM board WHERE board_type = 'CIRCLE';
DELETE FROM image WHERE domain = 'POST';
DELETE FROM common_file WHERE domain = 'POST';

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO board (board_id, board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 1, 'NOTICE', NULL, '공지사항', false, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM board WHERE board_id = 1);

INSERT INTO board (board_id, board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 2, 'FREE', NULL, '자유게시판', false, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM board WHERE board_id = 2);

INSERT INTO board (board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 'CIRCLE', 'NOTICE', '공지사항', false, c.circle_id, NOW(), NOW()
  FROM circle c
 WHERE c.current_member > 0
   AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');

INSERT INTO board (board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 'CIRCLE', 'INTRO', '자기소개', false, c.circle_id, NOW(), NOW()
  FROM circle c
 WHERE c.current_member > 0
   AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');

INSERT INTO board (board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 'CIRCLE', 'ACTIVITY', '모임활동', false, c.circle_id, NOW(), NOW()
  FROM circle c
 WHERE c.current_member > 0
   AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');

INSERT INTO board (board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 'CIRCLE', 'CUSTOM', CONCAT('자유게시판 ', c.circle_id), false, c.circle_id, NOW(), NOW()
  FROM circle c
 WHERE c.current_member > 0
   AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');

INSERT INTO board (board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date)
SELECT 'CIRCLE', 'CUSTOM', CONCAT('정보공유 ', c.circle_id), false, c.circle_id, NOW(), NOW()
  FROM circle c
 WHERE c.current_member > 0
   AND MOD(c.circle_id, 2) = 0
   AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');

INSERT INTO post (
    title, content, view_count, like_count, user_id, board_id,
    image_id, deleted, notice_category, pinned, pinned_at, activity_public,
    create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 100
)
SELECT
    CASE
        WHEN n <= 20 THEN CONCAT('[공지] ',
            CASE MOD(n, 10)
                WHEN 0 THEN '커뮤니티 운영 정책 안내'
                WHEN 1 THEN '서비스 이용 가이드 업데이트'
                WHEN 2 THEN '이번 달 공식 이벤트 오픈'
                WHEN 3 THEN '점검 일정 사전 공지'
                WHEN 4 THEN '신규 기능 배포 안내'
                WHEN 5 THEN '신고/제재 정책 리마인드'
                WHEN 6 THEN '모임 활동 인증 정책 안내'
                WHEN 7 THEN '커뮤니티 품질 개선 안내'
                WHEN 8 THEN '공지 게시판 운영 기준 안내'
                ELSE '앱 성능 개선 배포 안내' END)
        ELSE
            CASE MOD(n, 18)
                WHEN 0 THEN '주말에 같이 할 모임 추천 부탁드려요'
                WHEN 1 THEN '신규 가입 인사드립니다'
                WHEN 2 THEN '처음 참여하기 좋은 모임 있을까요?'
                WHEN 3 THEN '모임 끝나고 뒷풀이도 하시나요?'
                WHEN 4 THEN '활동 사진 정리 팁 공유해요'
                WHEN 5 THEN '오늘 참여한 모임 후기 남깁니다'
                WHEN 6 THEN '다음 정모 장소 추천 받아요'
                WHEN 7 THEN '초보도 참여하기 좋은 운동 모임 질문'
                WHEN 8 THEN '날씨 좋은 날 하기 좋은 활동 추천'
                WHEN 9 THEN '모임 매너 관련해서 의견 부탁드립니다'
                WHEN 10 THEN '첫 모임 참석 전 체크리스트 공유'
                WHEN 11 THEN '정기모임 출석률 올리는 방법 있을까요?'
                WHEN 12 THEN '모임 리더 운영팁 부탁드립니다'
                WHEN 13 THEN '모임에서 친해지는 방법 공유해요'
                WHEN 14 THEN '비 오는 날 실내 모임 추천'
                WHEN 15 THEN '사진 잘 나오는 모임 장소 알려주세요'
                WHEN 16 THEN '운동 모임 초보 준비물 질문'
                ELSE '스터디 모임 집중도 높이는 팁' END
    END AS title,    CASE
        WHEN n <= 20 THEN
            CASE MOD(n, 10)
                WHEN 0 THEN '<p>운영 정책이 최신 기준으로 갱신되었습니다.</p><p>중요 변경사항은 반드시 확인해 주세요.</p>'
                WHEN 1 THEN '<p>자주 묻는 질문을 반영해 이용 가이드를 개편했습니다.</p><p>초기 참여자도 쉽게 적응할 수 있도록 정리했습니다.</p>'
                WHEN 2 THEN '<p>이달의 커뮤니티 이벤트를 시작합니다.</p><p>참여 방법과 일정은 본문 하단 안내를 참고해 주세요.</p>'
                WHEN 3 THEN '<p>서버 안정화를 위한 정기 점검이 예정되어 있습니다.</p><p>점검 시간 동안 일부 기능이 제한될 수 있습니다.</p>'
                WHEN 4 THEN '<p>게시글 작성/검색/알림 기능이 개선되었습니다.</p><p>사용 중 불편사항은 문의 채널로 전달 부탁드립니다.</p>'
                WHEN 5 THEN '<p>모든 사용자에게 동일한 기준이 적용됩니다.</p><p>반복 위반 시 단계적 제재가 진행됩니다.</p>'
                WHEN 6 THEN '<p>모임 활동 피드의 공개 범위 정책을 정리했습니다.</p><p>게시 전 공개 설정을 한 번 더 확인해 주세요.</p>'
                WHEN 7 THEN '<p>커뮤니티 환경 개선을 위해 운영 모니터링을 강화합니다.</p><p>건전한 소통 문화 조성에 협조 부탁드립니다.</p>'
                WHEN 8 THEN '<p>공지 게시판은 운영팀 공식 안내 전용입니다.</p><p>문의는 자유게시판 또는 문의 채널을 이용해 주세요.</p>'
                ELSE '<p>서비스 이용 경험 향상을 위한 업데이트를 순차 배포 중입니다.</p><p>세부 변경 내역은 공지사항에서 지속 안내드리겠습니다.</p>' END
        ELSE
            CASE MOD(n, 18)
                WHEN 0 THEN '<p>이번 주말 일정 비우신 분들 계시면 함께할 모임 추천 부탁드려요.</p><p>분위기 좋은 곳이면 더 좋겠습니다.</p>'
                WHEN 1 THEN '<p>안녕하세요. 오늘 가입했고 관심사는 운동/취미 모임입니다.</p><p>처음 참여할 때 팁이 있다면 알려주세요.</p>'
                WHEN 2 THEN '<p>모임 참여가 처음이라 걱정되는데, 입문자에게 적합한 모임이 있을까요?</p><p>참여 난이도도 같이 알려주시면 감사해요.</p>'
                WHEN 3 THEN '<p>정모 후 가볍게 대화할 수 있는 2차 장소도 함께 정하시는지 궁금합니다.</p><p>운영 방식 공유 부탁드려요.</p>'
                WHEN 4 THEN '<p>활동 사진 정리할 때 폴더 규칙이나 공유 방식 어떻게 하시나요?</p><p>좋았던 방법 있으면 댓글로 알려주세요.</p>'
                WHEN 5 THEN '<p>최근 참여한 모임 분위기가 좋아서 후기 남깁니다.</p><p>다음 일정도 열리면 바로 신청하려고요.</p>'
                WHEN 6 THEN '<p>신입 멤버가 부담 없이 말 꺼낼 수 있는 분위기 만드는 팁이 궁금해요.</p><p>실제로 효과 있던 방법 공유 부탁드립니다.</p>'
                WHEN 7 THEN '<p>모임 공지 길이를 어느 정도로 맞추면 읽기 편한가요?</p><p>운영하시는 분들 의견 듣고 싶어요.</p>'
                WHEN 8 THEN '<p>활동 후 회고를 간단히 남기면 다음 모임 품질이 좋아지더라고요.</p><p>다들 어떤 방식으로 기록하시나요?</p>'
                WHEN 9 THEN '<p>비슷한 관심사끼리 소그룹 매칭해본 분 계신가요?</p><p>운영 난이도나 장단점이 궁금합니다.</p>'
                WHEN 10 THEN '<p>실내 모임 장소 잡을 때 우선순위를 어떻게 두세요?</p><p>접근성/가격/분위기 중 무엇이 가장 중요한지 궁금해요.</p>'
                WHEN 11 THEN '<p>모임 사진은 보통 누가 관리하시나요?</p><p>권한 분배 잘하는 방법 있으면 알려주세요.</p>'
                WHEN 12 THEN '<p>운동 모임에서 초보자 배려 규칙을 만들려고 합니다.</p><p>좋은 예시가 있으면 참고하고 싶어요.</p>'
                WHEN 13 THEN '<p>스터디 모임에서 지각/결석 기준을 어느 정도로 잡는 게 좋을까요?</p><p>너무 빡빡하지 않게 운영하고 싶습니다.</p>'
                WHEN 14 THEN '<p>주 1회 vs 격주 모임, 참여율 차이가 큰지 궁금합니다.</p><p>실제 운영 경험 공유 부탁드려요.</p>'
                WHEN 15 THEN '<p>신규 멤버 온보딩 메시지를 개선해보려 합니다.</p><p>첫 안내문에 꼭 넣어야 할 항목 추천해 주세요.</p>'
                WHEN 16 THEN '<p>야외 모임 진행 시 돌발 상황 대응 체크리스트를 만들고 있어요.</p><p>필수 항목 추천받습니다.</p>'
                ELSE '<p>모임 종료 후 만족도 체크를 간단 설문으로 받고 있는데요.</p><p>질문 문항 추천해주시면 감사하겠습니다.</p>' END
    END AS content,
    CASE WHEN n <= 20 THEN FLOOR(200 + RAND() * 2000) ELSE FLOOR(20 + RAND() * 900) END AS view_count,
    CASE WHEN n <= 20 THEN FLOOR(5 + RAND() * 100) ELSE FLOOR(RAND() * 60) END AS like_count,
    CASE WHEN n <= 20 THEN IF(MOD(n, 2) = 0, 1, 2)
         ELSE (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' AND u.user_role = 'USER' ORDER BY RAND() LIMIT 1) END AS user_id,
    CASE WHEN n <= 20 THEN 1 ELSE 2 END AS board_id,
    NULL, false,
    CASE WHEN n <= 20 THEN CASE MOD(n, 3) WHEN 1 THEN 'ANNOUNCEMENT' WHEN 2 THEN 'EVENT' ELSE 'UPDATE' END ELSE NULL END,
    IF(n <= 5, true, false), IF(n <= 5, NOW() - INTERVAL n DAY, NULL), false,
    NOW() - INTERVAL (220 - n) DAY, NOW() - INTERVAL FLOOR((220 - n) / 2) DAY
FROM seq;

INSERT INTO post (
    title, content, view_count, like_count, user_id, board_id,
    image_id, deleted, notice_category, pinned, pinned_at, activity_public,
    create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 40
)
SELECT
    CASE MOD(seq.n, 12)
        WHEN 0 THEN '이번 주 정기모임 안내'
        WHEN 1 THEN '출석 및 준비물 공지'
        WHEN 2 THEN '모임 운영 공지사항'
        WHEN 3 THEN '일정 변경 안내'
        WHEN 4 THEN '신입 멤버 인사드립니다'
        WHEN 5 THEN '자기소개 남겨요'
        WHEN 6 THEN CONCAT('자유게시판 ', c.circle_id, ' 정보 공유')
        WHEN 7 THEN CONCAT('자유게시판 ', c.circle_id, ' 후기 남깁니다')
        WHEN 8 THEN CONCAT('정보공유 ', c.circle_id, ' 질문 있습니다')
        WHEN 9 THEN CONCAT('정보공유 ', c.circle_id, ' 참여 후기')
        WHEN 10 THEN '모임 진행 팁 공유'
        ELSE '다음 일정 제안' END,
    CASE MOD(seq.n, 12)
        WHEN 0 THEN CONCAT('<p>모임 ', c.circle_id, ' 공지입니다.</p><p>일정/장소/준비물 확인 후 참여 부탁드립니다.</p>')
        WHEN 1 THEN '<p>이번 회차는 출석 체크 후 바로 활동을 시작합니다.</p><p>지각 예상 시 미리 알려주세요.</p>'
        WHEN 2 THEN '<p>장소가 기존과 다르니 지도 확인 부탁드립니다.</p><p>처음 오시는 분은 10분 일찍 도착 권장합니다.</p>'
        WHEN 3 THEN '<p>활동 난이도를 2개 그룹으로 나눠 진행합니다.</p><p>원하는 그룹을 댓글로 남겨주세요.</p>'
        WHEN 4 THEN '<p>안녕하세요! 새로 합류했습니다.</p><p>정기 활동에 적극 참여해보겠습니다.</p>'
        WHEN 5 THEN '<p>최근 비슷한 관심사를 가진 분들과 교류하고 싶어 가입했습니다.</p><p>잘 부탁드려요.</p>'
        WHEN 6 THEN '<p>활동 중 유용했던 자료를 정리했습니다.</p><p>필요하신 분들은 자유롭게 참고하세요.</p>'
        WHEN 7 THEN '<p>지난 회차 참여 후기입니다.</p><p>운영/분위기 모두 좋아서 다음 일정도 기대됩니다.</p>'
        WHEN 8 THEN '<p>준비물 체크하다가 헷갈리는 부분이 있어 질문 남깁니다.</p><p>경험자분들 조언 부탁드립니다.</p>'
        WHEN 9 THEN '<p>중간 참여자도 흐름 따라오기 쉬운 진행 방식 고민 중입니다.</p><p>의견 주시면 반영해보겠습니다.</p>'
        WHEN 10 THEN '<p>운영 효율 높이기 위한 아이디어 제안합니다.</p><p>가능하면 다음 회차에 시범 적용해보면 좋겠습니다.</p>'
        ELSE '<p>다음 일정 후보를 정리했습니다.</p><p>참여 가능한 시간대를 댓글로 남겨주세요.</p>' END,
    FLOOR(5 + RAND() * 700), FLOOR(RAND() * 40),
    (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1),
    CASE MOD(seq.n, 4)
        WHEN 0 THEN (SELECT b.board_id FROM board b WHERE b.circle_id = c.circle_id AND b.board_type = 'CIRCLE' AND b.circle_board_kind = 'NOTICE' AND b.deleted = false LIMIT 1)
        WHEN 1 THEN (SELECT b.board_id FROM board b WHERE b.circle_id = c.circle_id AND b.board_type = 'CIRCLE' AND b.circle_board_kind = 'INTRO' AND b.deleted = false LIMIT 1)
        WHEN 2 THEN (SELECT b.board_id FROM board b WHERE b.circle_id = c.circle_id AND b.board_type = 'CIRCLE' AND b.circle_board_kind = 'CUSTOM' AND b.deleted = false ORDER BY b.board_id LIMIT 1)
        ELSE COALESCE((SELECT b.board_id FROM board b WHERE b.circle_id = c.circle_id AND b.board_type = 'CIRCLE' AND b.circle_board_kind = 'CUSTOM' AND b.deleted = false ORDER BY b.board_id LIMIT 1 OFFSET 1),
                      (SELECT b.board_id FROM board b WHERE b.circle_id = c.circle_id AND b.board_type = 'CIRCLE' AND b.circle_board_kind = 'CUSTOM' AND b.deleted = false ORDER BY b.board_id LIMIT 1)) END,
    NULL, false, NULL, false, NULL, false,
    NOW() - INTERVAL FLOOR(RAND() * 180) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 90) DAY
FROM circle c
JOIN seq ON seq.n <= 20 + MOD(c.circle_id * 7, 21)
WHERE c.current_member > 0
  AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');
DROP TEMPORARY TABLE IF EXISTS tmp_activity_seed;
CREATE TEMPORARY TABLE tmp_activity_seed (
    circle_id BIGINT NOT NULL,
    seq_no INT NOT NULL,
    author_user_id BIGINT NOT NULL,
    seed_owner_key BIGINT NOT NULL,
    image_base_name VARCHAR(255) NOT NULL,
    image_file_name VARCHAR(255) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    activity_public BOOLEAN NOT NULL,
    PRIMARY KEY (circle_id, seq_no)
);

INSERT INTO tmp_activity_seed (
    circle_id, seq_no, author_user_id, seed_owner_key, image_base_name, image_file_name, image_path, title, content, activity_public
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 30
),
image_pool AS (
    SELECT 1 AS idx, 'afterparty-chat' AS base_name, 'afterparty-chat.jpg' AS file_name
    UNION ALL SELECT 2, 'boardgame-night', 'boardgame-night.jpg'
    UNION ALL SELECT 3, 'book-club', 'book-club.jpg'
    UNION ALL SELECT 4, 'brunch-meetup', 'brunch-meetup.jpg'
    UNION ALL SELECT 5, 'cafe-gathering', 'cafe-gathering.jpg'
    UNION ALL SELECT 6, 'coding-study', 'coding-study.jpg'
    UNION ALL SELECT 7, 'community-cleanup', 'community-cleanup.jpg'
    UNION ALL SELECT 8, 'cycling-ride', 'cycling-ride.jpg'
    UNION ALL SELECT 9, 'group-photo', 'group-photo.jpg'
    UNION ALL SELECT 10, 'hiking-trail', 'hiking-trail.jpg'
    UNION ALL SELECT 11, 'hobby-workshop', 'hobby-workshop.jpg'
    UNION ALL SELECT 12, 'indoor-activity', 'indoor-activity.jpg'
    UNION ALL SELECT 13, 'language-exchange', 'language-exchange.jpg'
    UNION ALL SELECT 14, 'meeting-snapshot', 'meeting-snapshot.png'
    UNION ALL SELECT 15, 'member-moment', 'member-moment.jpg'
    UNION ALL SELECT 16, 'movie-meetup', 'movie-meetup.webp'
    UNION ALL SELECT 17, 'music-jam', 'music-jam.jpg'
    UNION ALL SELECT 18, 'new-member-welcome', 'new-member-welcome.jpg'
    UNION ALL SELECT 19, 'night-walk', 'night-walk.png'
    UNION ALL SELECT 20, 'outdoor-activity', 'outdoor-activity.png'
    UNION ALL SELECT 21, 'photo-walk', 'photo-walk.jpg'
    UNION ALL SELECT 22, 'picnic-day', 'picnic-day.jpg'
    UNION ALL SELECT 23, 'running-club', 'running-club.webp'
    UNION ALL SELECT 24, 'sports-session', 'sports-session.png'
    UNION ALL SELECT 25, 'study-session', 'study-session.webp'
    UNION ALL SELECT 26, 'team-building', 'team-building.png'
    UNION ALL SELECT 27, 'volunteer-day', 'volunteer-day.png'
    UNION ALL SELECT 28, 'weekend-event', 'weekend-event.jpg'
    UNION ALL SELECT 29, 'workshop-craft', 'workshop-craft.jpg'
    UNION ALL SELECT 30, 'yoga-class', 'yoga-class.jpg'
)
SELECT
    c.circle_id,
    seq.n,
    (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1),
    -1 * (c.circle_id * 1000 + seq.n),
    ip.base_name,
    ip.file_name,
    CONCAT('/uploads/images/post/thumbnails/',
           ip.base_name,
           '_thm.webp'),
    CASE ip.idx
      WHEN 1 THEN '뒤풀이 대화 스냅'
      WHEN 2 THEN '보드게임 모임 기록'
      WHEN 3 THEN '북클럽 오늘의 장면'
      WHEN 4 THEN '브런치 모임 후기'
      WHEN 5 THEN '카페 모임 스케치'
      WHEN 6 THEN '코딩 스터디 현장'
      WHEN 7 THEN '커뮤니티 정화 활동'
      WHEN 8 THEN '자전거 라이딩 기록'
      WHEN 9 THEN '단체사진 공유'
      WHEN 10 THEN '등산 코스 스냅'
      WHEN 11 THEN '취미 워크샵 모임'
      WHEN 12 THEN '실내 활동 후기'
      WHEN 13 THEN '언어교환 모임 인증'
      WHEN 14 THEN '모임 스냅샷 아카이브'
      WHEN 15 THEN '멤버 모먼트 공유'
      WHEN 16 THEN '영화 모임 한 컷'
      WHEN 17 THEN '음악 잼 모임 기록'
      WHEN 18 THEN '신규 멤버 환영 모임'
      WHEN 19 THEN '야간 산책 기록'
      WHEN 20 THEN '야외 활동 하이라이트'
      WHEN 21 THEN '사진 산책 피드'
      WHEN 22 THEN '피크닉 데이 기록'
      WHEN 23 THEN '러닝 크루 모임'
      WHEN 24 THEN '스포츠 세션 후기'
      WHEN 25 THEN '스터디 세션 요약'
      WHEN 26 THEN '팀빌딩 활동 기록'
      WHEN 27 THEN '봉사활동 스냅'
      WHEN 28 THEN '주말 이벤트 공유'
      WHEN 29 THEN '공예 워크샵 아카이브'
      ELSE '요가 클래스 활동 기록'
    END,
    CONCAT(
        CASE ip.idx
            WHEN 1 THEN '<p>활동 후 자연스럽게 대화가 이어져서 서로 더 편해지는 시간이었습니다.</p><p>다음에도 짧게라도 뒤풀이 시간을 확보하면 좋겠습니다.</p>'
            WHEN 2 THEN '<p>룰 설명을 먼저 맞추고 시작하니 처음 참여한 멤버도 금방 적응했습니다.</p><p>중간중간 팀을 섞어 진행한 점도 반응이 좋았습니다.</p>'
            WHEN 3 THEN '<p>오늘 선정 도서 주제로 이야기가 깊게 이어져서 몰입감이 높았습니다.</p><p>다음 모임엔 추천 도서 리스트도 같이 정리해보겠습니다.</p>'
            WHEN 4 THEN '<p>브런치 장소가 조용해서 대화 중심 모임에 잘 맞았습니다.</p><p>시간대도 좋아서 참석률이 높게 유지됐습니다.</p>'
            WHEN 5 THEN '<p>카페 좌석 동선이 좋아서 소그룹 대화 전환이 수월했습니다.</p><p>다음에는 사진 포인트도 미리 안내해보겠습니다.</p>'
            WHEN 6 THEN '<p>실습 주제를 짧게 나눠 진행하니 집중이 끊기지 않았습니다.</p><p>질문 정리 시간을 따로 둔 게 특히 도움이 됐습니다.</p>'
            WHEN 7 THEN '<p>역할을 나눠 진행하니 작업 속도와 완성도가 모두 좋아졌습니다.</p><p>마무리 회고에서 다음 액션도 명확히 정리했습니다.</p>'
            WHEN 8 THEN '<p>코스 난이도가 적당해서 초보와 숙련자 모두 무리 없이 참여했습니다.</p><p>휴식 지점을 미리 잡아둔 덕분에 흐름이 안정적이었습니다.</p>'
            WHEN 9 THEN '<p>오늘 단체 컷이 잘 나와서 활동 분위기가 그대로 담겼습니다.</p><p>촬영 순서를 미리 정한 덕분에 진행도 빠르게 끝났어요.</p>'
            WHEN 10 THEN '<p>등산 구간별 페이스를 맞춰 이동하니 전체 리듬이 고르게 유지됐습니다.</p><p>정상 도착 후 짧은 회고까지 깔끔하게 마무리했습니다.</p>'
            WHEN 11 THEN '<p>워크샵 재료 준비가 충분해서 대기 없이 바로 시작할 수 있었습니다.</p><p>완성작 공유 시간도 분위기를 살리는 데 효과적이었습니다.</p>'
            WHEN 12 THEN '<p>실내 공간 컨디션이 좋아서 집중도가 기대보다 높았습니다.</p><p>좌석 배치를 바꿔가며 진행하니 소통도 자연스러웠습니다.</p>'
            WHEN 13 THEN '<p>짝을 바꿔가며 대화한 방식이 참여감을 높이는 데 큰 도움이 됐습니다.</p><p>초반 아이스브레이킹 질문도 효과가 좋았습니다.</p>'
            WHEN 14 THEN '<p>짧은 스냅 중심으로 기록하니 현장감이 잘 살아났습니다.</p><p>다음엔 촬영 담당을 교대로 운영해볼 계획입니다.</p>'
            WHEN 15 THEN '<p>각자 좋았던 순간을 공유하니 분위기가 한층 따뜻해졌습니다.</p><p>신규 멤버도 자연스럽게 의견을 내줘서 인상적이었습니다.</p>'
            WHEN 16 THEN '<p>상영 후 감상 나눔 시간을 충분히 둔 덕분에 대화 밀도가 높았습니다.</p><p>다음 회차 후보작도 현장에서 빠르게 정리했습니다.</p>'
            WHEN 17 THEN '<p>세션 순서를 단순하게 잡아 흐름이 끊기지 않았습니다.</p><p>합주 파트 교체 타이밍도 좋아서 완성도가 올라갔습니다.</p>'
            WHEN 18 THEN '<p>신규 멤버 중심으로 소개 시간을 넉넉히 가져가니 긴장이 많이 풀렸습니다.</p><p>기존 멤버의 안내도 자연스러워 정착에 도움이 됐습니다.</p>'
            WHEN 19 THEN '<p>야간 코스 안전 안내를 먼저 공유해 안정적으로 진행했습니다.</p><p>속도 조절이 잘 되어 마지막까지 컨디션이 좋았습니다.</p>'
            WHEN 20 THEN '<p>야외 활동 동선이 효율적이라 대기 시간이 거의 없었습니다.</p><p>날씨 변수 대응도 준비돼 있어 매끄럽게 운영됐습니다.</p>'
            WHEN 21 THEN '<p>사진 산책 구간을 테마별로 나눠 촬영하니 결과물이 다양하게 나왔습니다.</p><p>마지막에 베스트 컷을 함께 고른 것도 좋았습니다.</p>'
            WHEN 22 THEN '<p>피크닉 준비물을 분담해 가져오니 진행 부담이 크게 줄었습니다.</p><p>휴식과 활동 비율도 적절해서 만족도가 높았습니다.</p>'
            WHEN 23 THEN '<p>러닝 페이스 그룹을 나눠 운영하니 모두 무리 없이 완주했습니다.</p><p>종료 후 스트레칭까지 함께해서 컨디션 관리도 좋았습니다.</p>'
            WHEN 24 THEN '<p>기초와 응용을 분리해 진행하니 참여자별 만족도가 올라갔습니다.</p><p>다음 회차에 반영할 피드백도 충분히 모았습니다.</p>'
            WHEN 25 THEN '<p>스터디 주제를 작게 쪼개 발표하니 이해도가 높아졌습니다.</p><p>질의응답 시간을 늘린 점도 좋은 반응을 얻었습니다.</p>'
            WHEN 26 THEN '<p>팀별 역할을 명확히 나누니 의사결정 속도가 빨라졌습니다.</p><p>협업 과정이 자연스럽게 정리돼 회고도 수월했습니다.</p>'
            WHEN 27 THEN '<p>봉사 활동 구간을 사전에 브리핑해서 현장 혼선이 거의 없었습니다.</p><p>참여자 모두 적극적이어서 계획보다 빠르게 완료했습니다.</p>'
            WHEN 28 THEN '<p>주말 이벤트 동선과 시간표를 단순화해 운영 효율이 좋아졌습니다.</p><p>참여자 피드백도 전반적으로 긍정적이었습니다.</p>'
            WHEN 29 THEN '<p>공예 과정 설명을 단계별로 나누니 초보자도 쉽게 따라왔습니다.</p><p>완성품 공유 시간이 분위기를 더 살려줬습니다.</p>'
            ELSE '<p>호흡과 자세를 천천히 맞추며 진행해 전체 몰입감이 좋았습니다.</p><p>마무리 스트레칭까지 포함해 안정적으로 끝냈습니다.</p>'
        END,
        '<p>#모임활동 #커뮤니티 #함께하는취미</p><p><img src="',
        CONCAT('/uploads/images/post/', ip.file_name),
        '" alt="activity"></p>'
    ),
    IF(MOD(seq.n, 4) = 0, false, true)
FROM circle c
JOIN seq ON seq.n <= 15 + MOD(c.circle_id * 5, 16)
JOIN image_pool ip ON ip.idx = 1 + MOD(c.circle_id * 37 + seq.n, 30)
WHERE c.current_member > 0
  AND EXISTS (SELECT 1 FROM circle_member cm WHERE cm.circle_id = c.circle_id AND cm.status = 'ACTIVE');

INSERT INTO common_file (
    name, uuid, path, content_type, domain, owner_id,
    uploaded_by_user_id, deleted, status, create_date, update_date
)
SELECT t.image_file_name, UUID(), t.image_path, 'image/webp', 'POST', t.seed_owner_key,
       t.author_user_id, false, 'USED', NOW(), NOW()
FROM tmp_activity_seed t;

INSERT INTO image (
    name, uuid, path, domain, owner_id, uploaded_by_user_id, ord,
    deleted, status, create_date, update_date
)
SELECT t.image_file_name, UUID(), t.image_path, 'POST', t.seed_owner_key,
       t.author_user_id, 1, false, 'USED', NOW(), NOW()
FROM tmp_activity_seed t;

INSERT INTO post (
    title, content, view_count, like_count, user_id, board_id,
    image_id, deleted, notice_category, pinned, pinned_at, activity_public,
    create_date, update_date
)
SELECT
    t.title, t.content, FLOOR(10 + RAND() * 1200), FLOOR(RAND() * 100), t.author_user_id,
    (SELECT b.board_id FROM board b
      WHERE b.circle_id = t.circle_id AND b.board_type = 'CIRCLE' AND b.circle_board_kind = 'ACTIVITY' AND b.deleted = false
      LIMIT 1),
    (SELECT i.image_id FROM image i
      WHERE i.domain = 'POST' AND i.owner_id = t.seed_owner_key
      ORDER BY i.image_id DESC LIMIT 1),
    false, NULL, false, NULL, t.activity_public,
    NOW() - INTERVAL FLOOR(RAND() * 180) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 90) DAY
FROM tmp_activity_seed t;

UPDATE common_file cf
JOIN image i ON i.domain = 'POST' AND i.owner_id = cf.owner_id
JOIN post p ON p.image_id = i.image_id
SET cf.owner_id = p.post_id
WHERE cf.domain = 'POST'
  AND cf.owner_id < 0;

UPDATE image i
JOIN post p ON p.image_id = i.image_id
SET i.owner_id = p.post_id
WHERE i.domain = 'POST'
  AND i.owner_id < 0;
DROP TEMPORARY TABLE IF EXISTS tmp_post_reply_target;
CREATE TEMPORARY TABLE tmp_post_reply_target AS
SELECT p.post_id, b.circle_id, (2 + MOD(p.post_id, 14)) AS target_count
FROM post p JOIN board b ON b.board_id = p.board_id
WHERE p.deleted = false;

INSERT INTO reply (
    post_id, user_id, content, like_count,
    parent_id, reply_to_user_id, depth, deleted, create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 15
)
SELECT
    t.post_id,
    CASE WHEN t.circle_id IS NULL
      THEN (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
      ELSE (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = t.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
    END,
    CASE MOD(seq.n, 8)
      WHEN 0 THEN '좋은 정보 감사합니다. 바로 참고해볼게요.'
      WHEN 1 THEN '저도 비슷하게 생각했는데 정리해주셔서 도움됐어요.'
      WHEN 2 THEN '좋은 의견이에요. 다음 모임에서 이야기해봐요.'
      WHEN 3 THEN '오늘 모임 분위기 좋았어요. 다음에도 참석할게요.'
      WHEN 4 THEN '공지 확인했습니다. 준비물 챙겨서 갈게요.'
      WHEN 5 THEN '활동 사진 너무 좋네요. 기록 남겨줘서 고마워요.'
      WHEN 6 THEN '운영팀 고생 많으셨어요. 진행이 매끄러웠습니다.'
      ELSE '좋은 글 감사합니다. 의견도 함께 남겨봅니다.' END,
    FLOOR(RAND() * 4),
    NULL, NULL, 0, false,
    NOW() - INTERVAL FLOOR(RAND() * 180) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 90) DAY
FROM tmp_post_reply_target t
JOIN seq ON seq.n <= CEIL(t.target_count / 3);

DROP TEMPORARY TABLE IF EXISTS tmp_root_map;
CREATE TEMPORARY TABLE tmp_root_map AS
SELECT r.post_id, r.reply_id, r.user_id AS parent_user_id,
       ROW_NUMBER() OVER (PARTITION BY r.post_id ORDER BY r.reply_id) AS rn
FROM reply r
WHERE r.depth = 0;

INSERT INTO reply (
    post_id, user_id, content, like_count,
    parent_id, reply_to_user_id, depth, deleted, create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 15
)
SELECT
    t.post_id,
    CASE WHEN t.circle_id IS NULL
      THEN (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
      ELSE (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = t.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
    END,
    CASE MOD(seq.n, 8)
      WHEN 0 THEN '맞아요, 저도 같은 방식으로 하고 있어요.'
      WHEN 1 THEN '좋은 포인트네요. 설명 감사합니다.'
      WHEN 2 THEN '동의합니다. 실제로 효과 있었습니다.'
      WHEN 3 THEN '저도 비슷하게 느꼈어요. 공감합니다.'
      WHEN 4 THEN '현실적으로 적용 가능한 팁이라 좋네요.'
      WHEN 5 THEN '좋은 의견 감사합니다. 시도해보겠습니다.'
      WHEN 6 THEN '공지 내용 반영해서 준비하겠습니다.'
      ELSE '좋은 의견입니다. 저도 동의해요.' END,
    FLOOR(RAND() * 3),
    m.reply_id, m.parent_user_id, 1, false,
    NOW() - INTERVAL FLOOR(RAND() * 150) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 70) DAY
FROM tmp_post_reply_target t
JOIN seq ON seq.n <= FLOOR((t.target_count + 1) / 3)
JOIN tmp_root_map m ON m.post_id = t.post_id AND m.rn = seq.n;

DROP TEMPORARY TABLE IF EXISTS tmp_child_map;
CREATE TEMPORARY TABLE tmp_child_map AS
SELECT r.post_id, r.reply_id, r.user_id AS parent_user_id,
       ROW_NUMBER() OVER (PARTITION BY r.post_id ORDER BY r.reply_id) AS rn
FROM reply r
WHERE r.depth = 1;

INSERT INTO reply (
    post_id, user_id, content, like_count,
    parent_id, reply_to_user_id, depth, deleted, create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 15
)
SELECT
    t.post_id,
    CASE WHEN t.circle_id IS NULL
      THEN (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
      ELSE (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = t.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
    END,
    CASE MOD(seq.n, 8)
      WHEN 0 THEN '좋은 추가 의견 감사합니다.'
      WHEN 1 THEN '저도 그렇게 해보려고요.'
      WHEN 2 THEN '맞습니다, 그 부분이 핵심 같아요.'
      WHEN 3 THEN '덕분에 방향 정해졌습니다.'
      WHEN 4 THEN '저도 적용해보고 결과 공유할게요.'
      WHEN 5 THEN '합의된 것 같아서 좋습니다.'
      WHEN 6 THEN '피드백 감사합니다. 정리해둘게요.'
      ELSE '좋습니다. 다음 회차에도 참고해요.' END,
    FLOOR(RAND() * 2),
    m.reply_id, m.parent_user_id, 2, false,
    NOW() - INTERVAL FLOOR(RAND() * 120) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 50) DAY
FROM tmp_post_reply_target t
JOIN seq ON seq.n <= FLOOR(t.target_count / 3)
JOIN tmp_child_map m ON m.post_id = t.post_id AND m.rn = seq.n;

DROP TEMPORARY TABLE IF EXISTS tmp_post_metric;
CREATE TEMPORARY TABLE tmp_post_metric AS
SELECT p.post_id, b.board_type, b.circle_id,
       MOD(p.post_id, 16) AS reaction_target,
       MOD(p.post_id * 3, 9) AS bookmark_target,
       5 + MOD(p.post_id * 7, 46) AS view_target
FROM post p
JOIN board b ON b.board_id = p.board_id
WHERE p.deleted = false;

INSERT IGNORE INTO post_reaction (
    post_id, user_id, reaction_type, create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    m.post_id,
    CASE WHEN m.board_type = 'CIRCLE'
      THEN (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = m.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
      ELSE (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
    END,
    'LIKE', NOW() - INTERVAL FLOOR(RAND() * 160) DAY, NOW() - INTERVAL FLOOR(RAND() * 80) DAY
FROM tmp_post_metric m
JOIN seq ON seq.n <= m.reaction_target;

INSERT IGNORE INTO post_bookmark (
    post_id, user_id, create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 20
)
SELECT
    m.post_id,
    CASE WHEN m.board_type = 'CIRCLE'
      THEN (SELECT cm.user_id FROM circle_member cm WHERE cm.circle_id = m.circle_id AND cm.status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
      ELSE (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' ORDER BY RAND() LIMIT 1)
    END,
    NOW() - INTERVAL FLOOR(RAND() * 140) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 70) DAY
FROM tmp_post_metric m
JOIN seq ON seq.n <= m.bookmark_target;

INSERT IGNORE INTO post_view_log (
    post_id, viewer_ip, create_date, update_date
)
WITH RECURSIVE seq(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 60
)
SELECT
    m.post_id,
    CONCAT('10.', MOD(m.post_id, 240) + 1, '.', MOD(seq.n, 240) + 1, '.', MOD(m.post_id * seq.n, 254) + 1),
    NOW() - INTERVAL FLOOR(RAND() * 180) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 90) DAY
FROM tmp_post_metric m
JOIN seq ON seq.n <= m.view_target;

UPDATE post p
SET p.like_count = (SELECT COUNT(*) FROM post_reaction pr WHERE pr.post_id = p.post_id);

UPDATE post p
SET p.view_count = GREATEST(p.view_count, (SELECT COUNT(*) FROM post_view_log pv WHERE pv.post_id = p.post_id));
DROP TEMPORARY TABLE IF EXISTS tmp_report_post;
CREATE TEMPORARY TABLE tmp_report_post AS
SELECT target_id, target_user_id, rn
FROM (
    SELECT p.post_id AS target_id, p.user_id AS target_user_id,
           ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
    FROM post p
    WHERE p.deleted = false
) t
WHERE t.rn <= 15;

DROP TEMPORARY TABLE IF EXISTS tmp_report_reply;
CREATE TEMPORARY TABLE tmp_report_reply AS
SELECT target_id, target_user_id, rn
FROM (
    SELECT r.reply_id AS target_id, r.user_id AS target_user_id,
           ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
    FROM reply r
    WHERE r.deleted = false
) t
WHERE t.rn <= 10;

INSERT INTO report (
    reporter_id, target_type, target_id, category, description, status, admin_note, create_date, update_date
)
SELECT
    (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' AND u.user_id <> t.target_user_id ORDER BY RAND() LIMIT 1),
    'POST', t.target_id,
    CASE MOD(t.rn, 5)
        WHEN 0 THEN 'SPAM' WHEN 1 THEN 'ABUSE' WHEN 2 THEN 'INAPPROPRIATE' WHEN 3 THEN 'OTHER' ELSE 'OBSCENE' END,
    CONCAT('[AUTO-PR] 게시글 신고 생성 (postId=', t.target_id, ')'),
    CASE WHEN t.rn <= 9 THEN 'RESOLVED' WHEN t.rn <= 12 THEN 'PENDING' WHEN t.rn <= 14 THEN 'REVIEWING' ELSE 'REJECTED' END,
    CASE WHEN t.rn <= 9 THEN '확인 후 조치 완료' WHEN t.rn = 15 THEN '중복/사유 불충분으로 반려' ELSE NULL END,
    NOW() - INTERVAL FLOOR(RAND() * 160) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 80) DAY
FROM tmp_report_post t;

INSERT INTO report (
    reporter_id, target_type, target_id, category, description, status, admin_note, create_date, update_date
)
SELECT
    (SELECT u.user_id FROM users u WHERE u.user_status = 'ACTIVE' AND u.user_id <> t.target_user_id ORDER BY RAND() LIMIT 1),
    'REPLY', t.target_id,
    CASE MOD(t.rn, 4)
        WHEN 0 THEN 'ABUSE' WHEN 1 THEN 'OBSCENE' WHEN 2 THEN 'SPAM' ELSE 'OTHER' END,
    CONCAT('[AUTO-PR] 댓글 신고 생성 (replyId=', t.target_id, ')'),
    CASE WHEN t.rn <= 6 THEN 'RESOLVED' WHEN t.rn <= 8 THEN 'PENDING' WHEN t.rn = 9 THEN 'REVIEWING' ELSE 'REJECTED' END,
    CASE WHEN t.rn <= 6 THEN '댓글 확인 후 처리 완료' WHEN t.rn = 10 THEN '근거 부족으로 반려' ELSE NULL END,
    NOW() - INTERVAL FLOOR(RAND() * 140) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 70) DAY
FROM tmp_report_reply t;

INSERT INTO sanction (
    report_id, target_user_id, admin_id, target_type, target_id, sanction_type, reason,
    start_at, end_at, sanction_state, cancelled_by, cancel_reason, cancelled_at, create_date, update_date
)
SELECT
    r.id, t.target_user_id, IF(MOD(t.rn, 2) = 0, 1, 2), 'POST', t.target_id,
    CASE MOD(t.rn, 4) WHEN 0 THEN 'CONTENT_DELETE' WHEN 1 THEN 'WARNING' WHEN 2 THEN 'BAN_1D' ELSE 'CONTENT_DELETE' END,
    CASE MOD(t.rn, 4) WHEN 0 THEN '부적절 게시글 삭제 조치' WHEN 1 THEN '게시글 운영 정책 위반 경고' WHEN 2 THEN '반복 위반으로 단기 정지' ELSE '게시글 가이드 위반' END,
    NOW() - INTERVAL FLOOR(RAND() * 70) DAY,
    IF(MOD(t.rn, 4) = 2, NOW() - INTERVAL FLOOR(RAND() * 40) DAY, NULL),
    IF(MOD(t.rn, 4) = 2 AND MOD(t.rn, 2) = 0, 'LIFTED', 'ACTIVE'),
    NULL, NULL, NULL,
    NOW() - INTERVAL FLOOR(RAND() * 70) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 35) DAY
FROM tmp_report_post t
JOIN report r ON r.target_type = 'POST' AND r.target_id = t.target_id AND r.description LIKE '[AUTO-PR] 게시글 신고 생성%'
WHERE t.rn <= 9;

INSERT INTO sanction (
    report_id, target_user_id, admin_id, target_type, target_id, sanction_type, reason,
    start_at, end_at, sanction_state, cancelled_by, cancel_reason, cancelled_at, create_date, update_date
)
SELECT
    r.id, t.target_user_id, IF(MOD(t.rn, 2) = 0, 2, 1), 'REPLY', t.target_id,
    CASE MOD(t.rn, 3) WHEN 0 THEN 'WARNING' WHEN 1 THEN 'CONTENT_DELETE' ELSE 'BAN_1D' END,
    CASE MOD(t.rn, 3) WHEN 0 THEN '댓글 작성 가이드 위반 경고' WHEN 1 THEN '댓글 삭제 조치' ELSE '반복 비매너 댓글로 단기 정지' END,
    NOW() - INTERVAL FLOOR(RAND() * 60) DAY,
    IF(MOD(t.rn, 3) = 2, NOW() - INTERVAL FLOOR(RAND() * 25) DAY, NULL),
    IF(MOD(t.rn, 3) = 2, 'LIFTED', 'ACTIVE'),
    NULL, NULL, NULL,
    NOW() - INTERVAL FLOOR(RAND() * 60) DAY,
    NOW() - INTERVAL FLOOR(RAND() * 30) DAY
FROM tmp_report_reply t
JOIN report r ON r.target_type = 'REPLY' AND r.target_id = t.target_id AND r.description LIKE '[AUTO-PR] 댓글 신고 생성%'
WHERE t.rn <= 6;

INSERT INTO admin_action_log (
    actor_id, target_type, target_id, action_type, method_name, request_url,
    ip_address, user_agent, timestamp, success
)
SELECT
    s.admin_id, s.target_type, s.target_id,
    'DELETE',
    CASE WHEN s.target_type = 'POST' THEN 'seedPostReplyDeletePost' ELSE 'seedPostReplyDeleteReply' END,
    CASE WHEN s.target_type = 'POST' THEN CONCAT('/seed/admin/posts/', s.target_id) ELSE CONCAT('/seed/admin/replies/', s.target_id) END,
    '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL FLOOR(RAND() * 60) DAY, true
FROM sanction s
WHERE s.target_type IN ('POST', 'REPLY');

INSERT INTO admin_action_log (
    actor_id, target_type, target_id, action_type, method_name, request_url,
    ip_address, user_agent, timestamp, success
)
SELECT
    s.admin_id, 'USER', s.target_user_id,
    'SANCTION', 'seedPostReplyApplySanction', '/seed/admin/sanctions',
    '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL FLOOR(RAND() * 60) DAY, true
FROM sanction s
WHERE s.target_type IN ('POST', 'REPLY');

INSERT INTO admin_action_log (
    actor_id, target_type, target_id, action_type, method_name, request_url,
    ip_address, user_agent, timestamp, success
)
SELECT
    IF(MOD(r.id, 2) = 0, 1, 2), 'REPORT', r.id,
    'RESOLVE_REPORT', 'seedPostReplyResolveReport', CONCAT('/seed/admin/reports/', r.id, '/status'),
    '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL FLOOR(RAND() * 60) DAY, true
FROM report r
WHERE r.target_type IN ('POST', 'REPLY')
  AND r.status = 'RESOLVED';

DROP TEMPORARY TABLE IF EXISTS tmp_activity_seed;
DROP TEMPORARY TABLE IF EXISTS tmp_post_reply_target;
DROP TEMPORARY TABLE IF EXISTS tmp_root_map;
DROP TEMPORARY TABLE IF EXISTS tmp_child_map;
DROP TEMPORARY TABLE IF EXISTS tmp_post_metric;
DROP TEMPORARY TABLE IF EXISTS tmp_report_post;
DROP TEMPORARY TABLE IF EXISTS tmp_report_reply;

SELECT board_type, circle_board_kind, COUNT(*) AS board_count
  FROM board
 GROUP BY board_type, circle_board_kind
 ORDER BY board_type, circle_board_kind;

SELECT COUNT(*) AS community_post_count
  FROM post
 WHERE board_id IN (1, 2);

SELECT b.circle_id, COUNT(*) AS total_posts
  FROM post p
  JOIN board b ON b.board_id = p.board_id
 WHERE b.board_type = 'CIRCLE'
 GROUP BY b.circle_id
 ORDER BY b.circle_id;

SELECT MIN(reply_cnt) AS min_replies_per_post, MAX(reply_cnt) AS max_replies_per_post
  FROM (
      SELECT p.post_id, COUNT(r.reply_id) AS reply_cnt
        FROM post p
        LEFT JOIN reply r ON r.post_id = p.post_id
       GROUP BY p.post_id
  ) t;

SELECT COUNT(*) AS post_reaction_count FROM post_reaction;
SELECT COUNT(*) AS post_bookmark_count FROM post_bookmark;
SELECT COUNT(*) AS post_view_log_count FROM post_view_log;
SELECT target_type, COUNT(*) AS report_count FROM report GROUP BY target_type;
SELECT target_type, COUNT(*) AS sanction_count FROM sanction GROUP BY target_type;
