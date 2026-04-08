-- ============================================================
-- MOA 기본 데이터 (서비스 시작 시 자동 적재)
-- ============================================================
-- [요약]
-- - 용도: 서비스 기동 시 필수 마스터/기본 데이터 보장
-- - 특성: 전 구문 멱등(WHERE NOT EXISTS) 처리
-- - 관리자 계정: 2명
--   * admin@moa.com / moa1234!@
--   * admin2@moa.com / moa1234!@
-- - 글로벌 게시판: 2개 (공지사항, 자유게시판)
-- - 서클 카테고리: 12개
-- - 태그 카테고리: 15개
-- - 태그: 235개
-- - 주의: Spring SQL initializer 호환을 위해 SET NAMES 구문 미사용

-- 1) 관리자 계정 2명 (멱등 삽입)
-- 비밀번호: moa1234!@ (bcrypt 해시)
INSERT INTO users (
    user_id, name, email, password, nickname, birth_date, age, user_role, user_gender,
    provider, public_id, user_status, privacy_agreed_at, sanction_count, create_date, update_date
)
SELECT 1, '김관리', 'admin@moa.com',
       '{bcrypt}$2a$10$58.U9yHQuc8iYBPO9pngO.W0k32d2BPSXCkgNoO0ebIxZQ5Tsi/bW',
       '관리자', '1985-03-15', 41, 'ADMIN', 'MALE',
       'LOCAL', UUID(), 'ACTIVE', '2025-04-01 09:00:00',
       0, '2025-04-01 09:00:00', '2025-04-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = 1 OR email = 'admin@moa.com' OR nickname = '관리자');

INSERT INTO users (
    user_id, name, email, password, nickname, birth_date, age, user_role, user_gender,
    provider, public_id, user_status, privacy_agreed_at, sanction_count, create_date, update_date
)
SELECT 2, '이운영', 'admin2@moa.com',
       '{bcrypt}$2a$10$58.U9yHQuc8iYBPO9pngO.W0k32d2BPSXCkgNoO0ebIxZQ5Tsi/bW',
       '부관리자', '1990-07-22', 35, 'ADMIN', 'FEMALE',
       'LOCAL', UUID(), 'ACTIVE', '2025-04-01 09:00:00',
       0, '2025-04-01 09:00:00', '2025-04-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = 2 OR email = 'admin2@moa.com' OR nickname = '부관리자');

-- 2) 글로벌 게시판 2개 (멱등 삽입)
INSERT INTO board (
    board_id, board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date
)
SELECT 1, 'NOTICE', NULL, '공지사항', false, NULL, '2026-01-01 09:00:00', '2026-01-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM board WHERE board_id = 1 OR name = '공지사항');

INSERT INTO board (
    board_id, board_type, circle_board_kind, name, deleted, circle_id, create_date, update_date
)
SELECT 2, 'FREE', NULL, '자유게시판', false, NULL, '2026-01-01 09:00:00', '2026-01-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM board WHERE board_id = 2 OR name = '자유게시판');

-- 3) 서클 카테고리 (기본 12개, 멱등 삽입)
INSERT INTO circle_category (category_id, category_name)
SELECT 1, '운동'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 1 OR category_name = '운동');
INSERT INTO circle_category (category_id, category_name)
SELECT 2, '동네친구'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 2 OR category_name = '동네친구');
INSERT INTO circle_category (category_id, category_name)
SELECT 3, '아웃도어/여행'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 3 OR category_name = '아웃도어/여행');
INSERT INTO circle_category (category_id, category_name)
SELECT 4, '자기계발'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 4 OR category_name = '자기계발');
INSERT INTO circle_category (category_id, category_name)
SELECT 5, '가족/육아'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 5 OR category_name = '가족/육아');
INSERT INTO circle_category (category_id, category_name)
SELECT 6, '반려동물'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 6 OR category_name = '반려동물');
INSERT INTO circle_category (category_id, category_name)
SELECT 7, '음식/음료'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 7 OR category_name = '음식/음료');
INSERT INTO circle_category (category_id, category_name)
SELECT 8, '취미/오락'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 8 OR category_name = '취미/오락');
INSERT INTO circle_category (category_id, category_name)
SELECT 9, '독서/인문학'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 9 OR category_name = '독서/인문학');
INSERT INTO circle_category (category_id, category_name)
SELECT 10, '문화/예술'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 10 OR category_name = '문화/예술');
INSERT INTO circle_category (category_id, category_name)
SELECT 11, '음악/악기'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 11 OR category_name = '음악/악기');
INSERT INTO circle_category (category_id, category_name)
SELECT 12, '기타'
WHERE NOT EXISTS (SELECT 1 FROM circle_category WHERE category_id = 12 OR category_name = '기타');

-- 4) 태그 카테고리/태그 (멱등 삽입)
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 1, '분위기', 1, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 1 OR name = '분위기');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 2, '편의시설', 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 2 OR name = '편의시설');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 3, '용도', 3, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 3 OR name = '용도');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 4, '위치특성', 4, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 4 OR name = '위치특성');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 5, '공간유형', 5, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 5 OR name = '공간유형');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 6, '스포츠/운동', 6, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 6 OR name = '스포츠/운동');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 7, '음악/공연', 7, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 7 OR name = '음악/공연');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 8, '요리/식음', 8, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 8 OR name = '요리/식음');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 9, '교육/스터디', 9, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 9 OR name = '교육/스터디');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 10, '파티/이벤트', 10, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 10 OR name = '파티/이벤트');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 11, '촬영/미디어', 11, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 11 OR name = '촬영/미디어');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 12, '아웃도어', 12, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 12 OR name = '아웃도어');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 13, '힐링/웰니스', 13, true, true
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 13 OR name = '힐링/웰니스');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 14, '비즈니스', 14, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 14 OR name = '비즈니스');
INSERT INTO tag_category (id, name, sort_order, is_active, schedule_enabled)
SELECT 15, '특수시설', 15, true, false
WHERE NOT EXISTS (SELECT 1 FROM tag_category WHERE id = 15 OR name = '특수시설');

-- ── 분위기 (1) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 1, '조용한', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 1 OR (name = '조용한' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 2, '활기찬', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 2 OR (name = '활기찬' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 3, '아늑한', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 3 OR (name = '아늑한' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 4, '모던한', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 4 OR (name = '모던한' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 5, '빈티지', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 5 OR (name = '빈티지' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 6, '인더스트리얼', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 6 OR (name = '인더스트리얼' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 7, '내추럴', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 7 OR (name = '내추럴' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 8, '럭셔리', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 8 OR (name = '럭셔리' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 9, '미니멀', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 9 OR (name = '미니멀' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 10, '화이트톤', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 10 OR (name = '화이트톤' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 11, '우드톤', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 11 OR (name = '우드톤' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 12, '다크톤', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 12 OR (name = '다크톤' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 13, '밝은조명', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 13 OR (name = '밝은조명' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 14, '무드조명', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 14 OR (name = '무드조명' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 15, '감성적인', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 15 OR (name = '감성적인' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 16, '개방감있는', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 16 OR (name = '개방감있는' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 17, '프라이빗', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 17 OR (name = '프라이빗' AND tag_category_id = 1));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 18, '캐주얼', true, 1
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 18 OR (name = '캐주얼' AND tag_category_id = 1));
-- ── 편의시설 (2) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 19, '주차가능', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 19 OR (name = '주차가능' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 20, 'WIFI', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 20 OR (name = 'WIFI' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 21, '프로젝터', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 21 OR (name = '프로젝터' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 22, '음향시설', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 22 OR (name = '음향시설' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 23, '에어컨', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 23 OR (name = '에어컨' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 24, '난방', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 24 OR (name = '난방' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 25, '화장실', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 25 OR (name = '화장실' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 26, '샤워실', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 26 OR (name = '샤워실' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 27, '엘리베이터', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 27 OR (name = '엘리베이터' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 28, '무선마이크', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 28 OR (name = '무선마이크' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 29, '화이트보드', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 29 OR (name = '화이트보드' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 30, 'TV/모니터', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 30 OR (name = 'TV/모니터' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 31, '냉장고', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 31 OR (name = '냉장고' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 32, '전자레인지', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 32 OR (name = '전자레인지' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 33, '정수기', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 33 OR (name = '정수기' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 34, '콘센트다수', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 34 OR (name = '콘센트다수' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 35, '탈의실', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 35 OR (name = '탈의실' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 36, '사물함', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 36 OR (name = '사물함' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 37, '반려동물가능', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 37 OR (name = '반려동물가능' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 38, '장애인편의시설', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 38 OR (name = '장애인편의시설' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 39, '흡연구역', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 39 OR (name = '흡연구역' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 40, '유아시설', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 40 OR (name = '유아시설' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 41, '취사가능', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 41 OR (name = '취사가능' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 42, '음료제공', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 42 OR (name = '음료제공' AND tag_category_id = 2));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 43, '간식제공', true, 2
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 43 OR (name = '간식제공' AND tag_category_id = 2));
-- ── 용도 (3) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 44, '회의', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 44 OR (name = '회의' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 45, '파티', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 45 OR (name = '파티' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 46, '스터디', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 46 OR (name = '스터디' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 47, '워크샵', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 47 OR (name = '워크샵' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 48, '세미나', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 48 OR (name = '세미나' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 49, '강연', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 49 OR (name = '강연' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 50, '독서모임', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 50 OR (name = '독서모임' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 51, '소모임', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 51 OR (name = '소모임' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 52, '동아리', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 52 OR (name = '동아리' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 53, '팀빌딩', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 53 OR (name = '팀빌딩' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 54, '네트워킹', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 54 OR (name = '네트워킹' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 55, '면접', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 55 OR (name = '면접' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 56, '상담', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 56 OR (name = '상담' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 57, '코워킹', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 57 OR (name = '코워킹' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 58, '전시', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 58 OR (name = '전시' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 59, '공연', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 59 OR (name = '공연' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 60, '촬영', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 60 OR (name = '촬영' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 61, '라이브방송', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 61 OR (name = '라이브방송' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 62, '데이트', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 62 OR (name = '데이트' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 63, '가족모임', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 63 OR (name = '가족모임' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 64, '동창회', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 64 OR (name = '동창회' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 65, '팬미팅', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 65 OR (name = '팬미팅' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 66, '플리마켓', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 66 OR (name = '플리마켓' AND tag_category_id = 3));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 67, '팝업스토어', true, 3
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 67 OR (name = '팝업스토어' AND tag_category_id = 3));
-- ── 위치특성 (4) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 68, '역세권', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 68 OR (name = '역세권' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 69, '주택가', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 69 OR (name = '주택가' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 70, '번화가', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 70 OR (name = '번화가' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 71, '한강근처', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 71 OR (name = '한강근처' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 72, '산근처', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 72 OR (name = '산근처' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 73, '바다근처', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 73 OR (name = '바다근처' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 74, '공원근처', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 74 OR (name = '공원근처' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 75, '대학가', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 75 OR (name = '대학가' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 76, '오피스밀집', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 76 OR (name = '오피스밀집' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 77, '주차편리', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 77 OR (name = '주차편리' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 78, '골목안쪽', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 78 OR (name = '골목안쪽' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 79, '대로변', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 79 OR (name = '대로변' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 80, '루프탑', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 80 OR (name = '루프탑' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 81, '지하', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 81 OR (name = '지하' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 82, '고층뷰', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 82 OR (name = '고층뷰' AND tag_category_id = 4));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 83, '테라스', true, 4
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 83 OR (name = '테라스' AND tag_category_id = 4));
-- ── 공간유형 (5) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 84, '스튜디오', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 84 OR (name = '스튜디오' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 85, '카페', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 85 OR (name = '카페' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 86, '라운지', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 86 OR (name = '라운지' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 87, '홀', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 87 OR (name = '홀' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 88, '연습실', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 88 OR (name = '연습실' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 89, '레지던스', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 89 OR (name = '레지던스' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 90, '펜션', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 90 OR (name = '펜션' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 91, '글램핑', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 91 OR (name = '글램핑' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 92, '한옥', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 92 OR (name = '한옥' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 93, '갤러리', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 93 OR (name = '갤러리' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 94, '루프탑바', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 94 OR (name = '루프탑바' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 95, '오피스', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 95 OR (name = '오피스' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 96, '공유주방', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 96 OR (name = '공유주방' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 97, '컨퍼런스룸', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 97 OR (name = '컨퍼런스룸' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 98, '다목적홀', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 98 OR (name = '다목적홀' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 99, '실외공간', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 99 OR (name = '실외공간' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 100, '지하공간', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 100 OR (name = '지하공간' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 101, '복층', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 101 OR (name = '복층' AND tag_category_id = 5));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 102, '원룸형', true, 5
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 102 OR (name = '원룸형' AND tag_category_id = 5));
-- ── 스포츠/운동 (6) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 103, '풋살', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 103 OR (name = '풋살' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 104, '테니스', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 104 OR (name = '테니스' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 105, '배드민턴', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 105 OR (name = '배드민턴' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 106, '탁구', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 106 OR (name = '탁구' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 107, '농구', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 107 OR (name = '농구' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 108, '볼링', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 108 OR (name = '볼링' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 109, '당구/포켓볼', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 109 OR (name = '당구/포켓볼' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 110, '요가', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 110 OR (name = '요가' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 111, '필라테스', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 111 OR (name = '필라테스' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 112, '크로스핏', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 112 OR (name = '크로스핏' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 113, '복싱', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 113 OR (name = '복싱' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 114, '댄스', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 114 OR (name = '댄스' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 115, '클라이밍', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 115 OR (name = '클라이밍' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 116, '수영', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 116 OR (name = '수영' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 117, '서핑', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 117 OR (name = '서핑' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 118, '스쿼시', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 118 OR (name = '스쿼시' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 119, '골프연습장', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 119 OR (name = '골프연습장' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 120, '양궁', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 120 OR (name = '양궁' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 121, '승마', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 121 OR (name = '승마' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 122, '인라인/스케이트', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 122 OR (name = '인라인/스케이트' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 123, '스키/보드', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 123 OR (name = '스키/보드' AND tag_category_id = 6));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 124, '프리다이빙', true, 6
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 124 OR (name = '프리다이빙' AND tag_category_id = 6));
-- ── 음악/공연 (7) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 125, '밴드합주', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 125 OR (name = '밴드합주' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 126, '드럼연습', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 126 OR (name = '드럼연습' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 127, '피아노연습', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 127 OR (name = '피아노연습' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 128, '기타/어쿠스틱', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 128 OR (name = '기타/어쿠스틱' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 129, '보컬연습', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 129 OR (name = '보컬연습' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 130, 'DJ부스', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 130 OR (name = 'DJ부스' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 131, '녹음실', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 131 OR (name = '녹음실' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 132, '공연무대', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 132 OR (name = '공연무대' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 133, '버스킹', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 133 OR (name = '버스킹' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 134, '노래방시설', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 134 OR (name = '노래방시설' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 135, '악기보관', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 135 OR (name = '악기보관' AND tag_category_id = 7));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 136, '방음완벽', true, 7
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 136 OR (name = '방음완벽' AND tag_category_id = 7));
-- ── 요리/식음 (8) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 137, '쿠킹클래스', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 137 OR (name = '쿠킹클래스' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 138, '베이킹', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 138 OR (name = '베이킹' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 139, '바리스타', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 139 OR (name = '바리스타' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 140, '와인/소믈리에', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 140 OR (name = '와인/소믈리에' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 141, '수제맥주', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 141 OR (name = '수제맥주' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 142, 'BBQ/그릴', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 142 OR (name = 'BBQ/그릴' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 143, '한식조리', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 143 OR (name = '한식조리' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 144, '양식조리', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 144 OR (name = '양식조리' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 145, '일식/초밥', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 145 OR (name = '일식/초밥' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 146, '디저트', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 146 OR (name = '디저트' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 147, '칵테일', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 147 OR (name = '칵테일' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 148, '전통주', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 148 OR (name = '전통주' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 149, '비건/채식', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 149 OR (name = '비건/채식' AND tag_category_id = 8));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 150, '케이터링가능', true, 8
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 150 OR (name = '케이터링가능' AND tag_category_id = 8));
-- ── 교육/스터디 (9) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 151, '코딩/IT', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 151 OR (name = '코딩/IT' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 152, '어학', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 152 OR (name = '어학' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 153, '수능/입시', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 153 OR (name = '수능/입시' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 154, '자격증', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 154 OR (name = '자격증' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 155, '독서토론', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 155 OR (name = '독서토론' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 156, '글쓰기/작문', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 156 OR (name = '글쓰기/작문' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 157, '미술/드로잉', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 157 OR (name = '미술/드로잉' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 158, '사진/영상', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 158 OR (name = '사진/영상' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 159, '공예/핸드메이드', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 159 OR (name = '공예/핸드메이드' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 160, '플라워/화훼', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 160 OR (name = '플라워/화훼' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 161, '캘리그라피', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 161 OR (name = '캘리그라피' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 162, '도예/도자기', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 162 OR (name = '도예/도자기' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 163, '가죽공예', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 163 OR (name = '가죽공예' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 164, '뜨개질/자수', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 164 OR (name = '뜨개질/자수' AND tag_category_id = 9));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 165, '향수/캔들', true, 9
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 165 OR (name = '향수/캔들' AND tag_category_id = 9));
-- ── 파티/이벤트 (10) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 166, '생일파티', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 166 OR (name = '생일파티' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 167, '베이비샤워', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 167 OR (name = '베이비샤워' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 168, '브라이덜샤워', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 168 OR (name = '브라이덜샤워' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 169, '졸업파티', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 169 OR (name = '졸업파티' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 170, '송년회/신년회', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 170 OR (name = '송년회/신년회' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 171, '기업행사', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 171 OR (name = '기업행사' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 172, '클럽파티', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 172 OR (name = '클럽파티' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 173, '할로윈파티', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 173 OR (name = '할로윈파티' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 174, '크리스마스파티', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 174 OR (name = '크리스마스파티' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 175, '수영장파티', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 175 OR (name = '수영장파티' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 176, '코스프레', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 176 OR (name = '코스프레' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 177, '보드게임', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 177 OR (name = '보드게임' AND tag_category_id = 10));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 178, '방탈출', true, 10
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 178 OR (name = '방탈출' AND tag_category_id = 10));
-- ── 촬영/미디어 (11) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 179, '사진촬영', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 179 OR (name = '사진촬영' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 180, '영상촬영', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 180 OR (name = '영상촬영' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 181, '유튜브/브이로그', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 181 OR (name = '유튜브/브이로그' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 182, '팟캐스트', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 182 OR (name = '팟캐스트' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 183, '제품촬영', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 183 OR (name = '제품촬영' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 184, '인물촬영', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 184 OR (name = '인물촬영' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 185, '웨딩촬영', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 185 OR (name = '웨딩촬영' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 186, '증명사진', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 186 OR (name = '증명사진' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 187, '크로마키', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 187 OR (name = '크로마키' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 188, '조명장비', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 188 OR (name = '조명장비' AND tag_category_id = 11));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 189, '드레스룸', true, 11
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 189 OR (name = '드레스룸' AND tag_category_id = 11));
-- ── 아웃도어 (12) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 190, '캠핑', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 190 OR (name = '캠핑' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 191, '글램핑', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 191 OR (name = '글램핑' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 192, '바베큐', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 192 OR (name = '바베큐' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 193, '트레킹/등산', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 193 OR (name = '트레킹/등산' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 194, '자전거', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 194 OR (name = '자전거' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 195, '카약/카누', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 195 OR (name = '카약/카누' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 196, '낚시', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 196 OR (name = '낚시' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 197, '별관측', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 197 OR (name = '별관측' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 198, '루프탑정원', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 198 OR (name = '루프탑정원' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 199, '옥상텃밭', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 199 OR (name = '옥상텃밭' AND tag_category_id = 12));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 200, '피크닉', true, 12
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 200 OR (name = '피크닉' AND tag_category_id = 12));
-- ── 힐링/웰니스 (13) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 201, '명상', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 201 OR (name = '명상' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 202, '아로마테라피', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 202 OR (name = '아로마테라피' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 203, '스파/사우나', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 203 OR (name = '스파/사우나' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 204, '족욕', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 204 OR (name = '족욕' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 205, '반신욕', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 205 OR (name = '반신욕' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 206, '마사지', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 206 OR (name = '마사지' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 207, '숲치유', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 207 OR (name = '숲치유' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 208, '티세레모니', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 208 OR (name = '티세레모니' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 209, '사운드힐링', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 209 OR (name = '사운드힐링' AND tag_category_id = 13));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 210, '독서치유', true, 13
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 210 OR (name = '독서치유' AND tag_category_id = 13));
-- ── 비즈니스 (14) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 211, '프레젠테이션', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 211 OR (name = '프레젠테이션' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 212, '화상회의', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 212 OR (name = '화상회의' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 213, '인터뷰룸', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 213 OR (name = '인터뷰룸' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 214, '공유오피스', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 214 OR (name = '공유오피스' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 215, '1인사무실', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 215 OR (name = '1인사무실' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 216, '미팅룸', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 216 OR (name = '미팅룸' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 217, '교육장', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 217 OR (name = '교육장' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 218, '컨퍼런스', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 218 OR (name = '컨퍼런스' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 219, '이사회실', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 219 OR (name = '이사회실' AND tag_category_id = 14));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 220, '법인설립주소', true, 14
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 220 OR (name = '법인설립주소' AND tag_category_id = 14));
-- ── 특수시설 (15) ──
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 221, '수영장', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 221 OR (name = '수영장' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 222, '자쿠지', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 222 OR (name = '자쿠지' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 223, '벽난로', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 223 OR (name = '벽난로' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 224, '노천탕', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 224 OR (name = '노천탕' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 225, '대형스크린', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 225 OR (name = '대형스크린' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 226, '무대/스테이지', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 226 OR (name = '무대/스테이지' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 227, '미러월', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 227 OR (name = '미러월' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 228, '바카운터', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 228 OR (name = '바카운터' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 229, 'VR장비', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 229 OR (name = 'VR장비' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 230, '포토존', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 230 OR (name = '포토존' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 231, '키즈룸', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 231 OR (name = '키즈룸' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 232, '짐/헬스장비', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 232 OR (name = '짐/헬스장비' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 233, '암벽', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 233 OR (name = '암벽' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 234, '런닝머신', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 234 OR (name = '런닝머신' AND tag_category_id = 15));
INSERT INTO tag (id, name, is_active, tag_category_id)
SELECT 235, '사격장', true, 15
WHERE NOT EXISTS (SELECT 1 FROM tag WHERE id = 235 OR (name = '사격장' AND tag_category_id = 15));




