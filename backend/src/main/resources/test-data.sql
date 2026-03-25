-- ============================================================
-- MOA 장소 추천 테스트 데이터 (임베딩 기반 추천 테스트용)
-- 로컬 MySQL에서 직접 실행하세요.
-- ============================================================

SET NAMES utf8mb4;

-- 1. 테스트 유저 (리뷰 작성용)
INSERT INTO users (name, email, password, nickname, birth_date, age, user_role, user_gender, provider, public_id, user_status, privacy_agreed_at, sanction_count, create_date, update_date) VALUES
('테스트유저1', 'tester1@moa.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'tester1', '1995-03-15', 30, 'USER', 'MALE',   'LOCAL', 'aabbccdd-0001-0001-0001-aabbccdd0001', 'ACTIVE', '2025-01-01 00:00:00', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('테스트유저2', 'tester2@moa.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'tester2', '1998-07-22', 26, 'USER', 'FEMALE', 'LOCAL', 'aabbccdd-0002-0002-0002-aabbccdd0002', 'ACTIVE', '2025-01-01 00:00:00', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('테스트유저3', 'tester3@moa.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'tester3', '1993-11-08', 31, 'USER', 'MALE',   'LOCAL', 'aabbccdd-0003-0003-0003-aabbccdd0003', 'ACTIVE', '2025-01-01 00:00:00', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('테스트유저4', 'tester4@moa.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'tester4', '2000-01-30', 25, 'USER', 'FEMALE', 'LOCAL', 'aabbccdd-0004-0004-0004-aabbccdd0004', 'ACTIVE', '2025-01-01 00:00:00', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('테스트유저5', 'tester5@moa.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'tester5', '1997-05-18', 27, 'USER', 'MALE',   'LOCAL', 'aabbccdd-0005-0005-0005-aabbccdd0005', 'ACTIVE', '2025-01-01 00:00:00', 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 2. 태그 (100개)
INSERT INTO tag (name) VALUES
-- 분위기 (10)
('아늑한'), ('모던한'), ('인스타감성'), ('빈티지'), ('럭셔리'),
('캐주얼'), ('조용한'), ('활기찬'), ('아기자기한'), ('미니멀한'),
-- 학습/업무 (10)
('스터디'), ('회의'), ('집중력향상'), ('프레젠테이션'), ('강의'),
('코딩'), ('그룹스터디'), ('독서'), ('자격증'), ('언어학습'),
-- 모임/파티 (10)
('파티'), ('생일파티'), ('소셜모임'), ('동아리'), ('팀빌딩'),
('워크샵'), ('기업행사'), ('웨딩촬영'), ('돌잔치'), ('친목'),
-- 편의시설 (15)
('주차'), ('와이파이'), ('에어컨'), ('빔프로젝터'), ('화이트보드'),
('음향장비'), ('조명'), ('주방'), ('샤워실'), ('스크린'),
('냉장고'), ('전자레인지'), ('마이크'), ('악기대여'), ('방음'),
-- 스포츠/운동 (10)
('요가'), ('필라테스'), ('댄스'), ('클라이밍'), ('탁구'),
('배드민턴'), ('복싱'), ('헬스'), ('스트레칭'), ('수영'),
-- 음식/음료 (10)
('바베큐'), ('케이터링'), ('카페음료'), ('주류'), ('요리실습'),
('베이킹'), ('와인'), ('커피머신'), ('간식'), ('채식'),
-- 문화/예술 (10)
('미술'), ('음악'), ('사진'), ('영상제작'), ('도예'),
('목공'), ('드로잉'), ('공예'), ('악기연습'), ('창작'),
-- 위치/특성 (10)
('역세권'), ('루프탑'), ('한강뷰'), ('도심뷰'), ('자연채광'),
('야외'), ('금연'), ('24시간'), ('반려동물'), ('친환경'),
-- 엔터테인먼트 (10)
('보드게임'), ('방탈출'), ('VR'), ('노래방'), ('당구'),
('게임'), ('마술'), ('공연'), ('영화감상'), ('파티게임'),
-- 규모/대상 (5)
('소규모'), ('대형'), ('프라이빗'), ('커플'), ('가족');

-- 3. 장소 (50개)
INSERT INTO place (name, address, city, district, latitude, longitude, capacity, price_per_hour, description, min_reservation_hour, max_reservation_hour, open_time, close_time, create_date, update_date) VALUES
-- [1-10] 스터디/업무 공간
('강남 집중 스터디룸',      '서울 강남구 테헤란로 101',        '서울', '강남구',   37.4985, 127.0275, 8,  5000,  '강남역 도보 3분 거리의 조용하고 집중력 향상에 최적화된 프리미엄 스터디룸입니다. 완벽한 방음 시설과 개인 조명, 고속 와이파이를 갖추고 있습니다. 1인부터 소그룹 스터디까지 활용 가능하며 자격증 시험 준비, 영어 스터디, 그룹 독서 모임에 자주 사용됩니다.', 2, 8, '09:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('홍대 코워킹 스페이스',    '서울 마포구 어울마당로 65',        '서울', '마포구',   37.5563, 126.9241, 20, 8000,  '홍대 중심가의 트렌디한 코워킹 스페이스입니다. 고속 인터넷, 프린터, 회의실을 갖추고 있으며 스타트업, 프리랜서, IT 업계 종사자들이 즐겨 찾습니다. 네트워킹 행사와 세미나도 자주 열립니다.', 2, 12, '08:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('성수 스마트 오피스',      '서울 성동구 성수이로 120',         '서울', '성동구',   37.5447, 127.0566, 15, 10000, '성수동 감성의 스마트 오피스로 빔프로젝터, 대형 스크린, 화이트보드를 완비하고 있습니다. 팀 프레젠테이션과 워크샵에 최적화되어 있으며 기업 팀빌딩 행사에도 인기가 높습니다.', 2, 10, '09:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('여의도 비즈니스 센터',    '서울 영등포구 여의대로 24',        '서울', '영등포구', 37.5216, 126.9244, 12, 12000, '여의도 금융가 중심의 프로페셔널 비즈니스 센터입니다. 화상회의 시스템, 화이트보드, 음향 장비를 갖추고 있어 임원 회의와 기업 프레젠테이션에 적합합니다.', 2, 8, '08:00:00', '20:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('종로 조용한 독서실',      '서울 종로구 종로 120',             '서울', '종로구',   37.5702, 126.9817, 10, 3000,  '종로의 조용하고 아늑한 독서실입니다. 개인 집중 부스와 소그룹 스터디 공간을 모두 갖추고 있으며 24시간 운영으로 시험 준비생들에게 특히 인기 있습니다. 에르고노믹 의자와 눈 편한 조명으로 장시간 독서와 공부에 최적화되어 있습니다.', 1, 12, '00:00:00', '23:59:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('마포 스터디 카페',        '서울 마포구 월드컵북로 88',        '서울', '마포구',   37.5495, 126.9137, 16, 4000,  '합정 인근 카페 분위기의 스터디 공간입니다. 맛있는 커피를 즐기며 공부할 수 있으며 특히 영어, 중국어 등 외국어 회화 스터디 모임에 자주 사용됩니다. 커피머신이 구비되어 있습니다.', 2, 8, '09:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('건대 그룹 스터디룸',      '서울 광진구 능동로 120',           '서울', '광진구',   37.5407, 127.0710, 12, 4500,  '건국대 인근 그룹 스터디에 특화된 공간입니다. 대형 모니터, 화이트보드, 조용한 환경으로 팀 프로젝트와 그룹 스터디에 최적화되어 있습니다. 자격증 준비생과 취업 준비생이 많이 찾습니다.', 2, 10, '09:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('신촌 프리미엄 독서실',    '서울 서대문구 신촌로 88',          '서울', '서대문구', 37.5561, 126.9368, 8,  3500,  '신촌역 도보 5분의 프리미엄 독서실입니다. 개인 칸막이로 완전한 프라이버시를 보장하며 에르고노믹 의자, 부드러운 조명, 완벽한 방음으로 집중 학습이 가능합니다. 대학생과 취업 준비생에게 인기 있습니다.', 1, 8, '08:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('압구정 프라이빗 오피스',  '서울 강남구 압구정로 200',         '서울', '강남구',   37.5274, 127.0268, 6,  15000, '압구정의 고급 프라이빗 오피스입니다. 럭셔리한 인테리어와 최신 장비로 VIP 비즈니스 미팅과 프레젠테이션에 적합하며 완전한 프라이버시가 보장됩니다.', 2, 6, '09:00:00', '20:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('이태원 글로벌 코워킹',    '서울 용산구 이태원로 55',          '서울', '용산구',   37.5340, 126.9940, 25, 7000,  '이태원 중심의 국제적 분위기 코워킹 스페이스입니다. 다국적 기업과 외국인 프리랜서들이 자주 찾으며 영어 회화 스터디와 글로벌 네트워킹에 최적화되어 있습니다.', 2, 12, '08:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
-- [11-20] 파티/모임 공간
('강남 럭셔리 파티룸',      '서울 강남구 봉은사로 424',         '서울', '강남구',   37.5060, 127.0550, 30, 30000, '강남 최고급 파티룸으로 화려한 인테리어와 최첨단 음향, 조명 시스템을 갖추고 있습니다. 생일파티, 기념일, 소셜 모임에 완벽한 공간이며 케이터링 서비스 연계 가능하고 DJ 부스와 댄스 플로어도 있습니다.', 3, 10, '12:00:00', '03:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('홍대 인스타 파티룸',      '서울 마포구 와우산로 29',          '서울', '마포구',   37.5524, 126.9241, 20, 20000, '홍대 핫플레이스의 인스타감성 파티룸입니다. 네온 조명, 포토 스팟, 최신 블루투스 스피커를 갖추고 있어 SNS 인증샷을 남기기 좋습니다. 생일 파티와 소규모 모임에 인기 있습니다.', 2, 8, '12:00:00', '01:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('성수 빈티지 파티룸',      '서울 성동구 아차산로 120',         '서울', '성동구',   37.5470, 127.0530, 25, 18000, '성수동 인더스트리얼 빈티지 감성의 파티룸입니다. 노출 콘크리트, 빈티지 가구, 캔들 조명으로 분위기 있는 모임이 가능합니다. 동창 모임, 소셜 파티에 인기 있으며 셀프바 세팅이 포함됩니다.', 2, 8, '13:00:00', '02:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('한남 루프탑 파티공간',    '서울 용산구 한남대로 84',          '서울', '용산구',   37.5376, 127.0014, 40, 40000, '한남동 언덕 위 서울 도심 뷰가 압도적인 루프탑 파티 공간입니다. 탁 트인 하늘 아래 바베큐, 칵테일 파티, 야외 소셜 이벤트를 즐길 수 있습니다. 일몰부터 야경까지 황홀한 뷰를 자랑합니다.', 3, 10, '15:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('이태원 프라이빗 파티룸',  '서울 용산구 이태원로 180',         '서울', '용산구',   37.5330, 126.9990, 15, 25000, '이태원 글로벌 분위기의 완전 독립 프라이빗 파티룸입니다. 외국인 친화적 분위기와 주류 반입 가능, 음향 시스템으로 미국식 하우스 파티 콘셉트의 소셜 파티를 즐길 수 있습니다.', 2, 6, '14:00:00', '02:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('마포 생일파티 전용룸',    '서울 마포구 독막로 96',            '서울', '마포구',   37.5496, 126.9200, 12, 15000, '합정의 아기자기하고 귀여운 생일파티 전용 공간입니다. 파티 데코레이션 세팅, 케이크 서비스, 포토 부스를 포함하며 소규모 친밀한 생일 파티와 깜짝 이벤트에 최적화되어 있습니다.', 2, 6, '10:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('여의도 한강뷰 파티룸',    '서울 영등포구 여의동로 330',       '서울', '영등포구', 37.5200, 126.9320, 35, 35000, '한강이 한눈에 보이는 여의도 한강뷰 파티룸입니다. 탁 트인 한강 전망과 고급 인테리어로 기업 리셉션, 생일파티, 돌잔치, 환갑잔치 등 다양한 행사에 사용됩니다.', 3, 12, '12:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('종로 레트로 파티룸',      '서울 종로구 인사동5길 12',         '서울', '종로구',   37.5718, 126.9847, 20, 15000, '종로 인사동 인근 한국 레트로 감성의 파티룸입니다. 70-90년대 복고풍 인테리어와 빈티지 소품들로 독특한 분위기를 연출합니다. 복고 테마 파티, 동창 모임에 특히 인기 있습니다.', 2, 8, '12:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('압구정 VIP 파티룸',       '서울 강남구 압구정로 410',         '서울', '강남구',   37.5270, 127.0375, 25, 50000, '압구정 최고급 VIP 파티룸으로 5성급 호텔 수준의 서비스를 자랑합니다. 개인 버틀러, 고급 케이터링, 최첨단 AV 시스템으로 CEO 생일파티, 기업 VIP 리셉션에 최고의 선택입니다.', 4, 8, '14:00:00', '02:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('건대 소셜 파티룸',        '서울 광진구 능동로 210',           '서울', '광진구',   37.5413, 127.0714, 20, 12000, '건대 인근 젊고 활기찬 소셜 파티룸입니다. 대학생과 20-30대를 위한 캐주얼한 분위기로 동아리 MT, 과 행사, 친목 파티에 안성맞춤입니다. 보드게임과 파티게임을 갖추고 있습니다.', 2, 8, '13:00:00', '01:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
-- [21-28] 스포츠/운동
('강남 프리미엄 헬스장',    '서울 강남구 테헤란로 220',         '서울', '강남구',   37.5039, 127.0275, 20, 15000, '강남 최신 시설의 프리미엄 헬스장입니다. 최고급 피트니스 장비, 개인 PT 공간, 샤워 시설을 완비하고 있습니다. 헬스, 스트레칭, 개인 트레이닝을 위한 완벽한 환경을 제공하며 운동 동호회 행사에도 자주 사용됩니다.', 1, 4, '06:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('홍대 댄스 스튜디오',      '서울 마포구 와우산로 120',         '서울', '마포구',   37.5540, 126.9254, 15, 10000, '홍대 댄스 씬의 전문 댄스 스튜디오입니다. 스프링 바닥, 전면 거울, 최고급 음향 시스템으로 힙합, 케이팝, 팝핀, 비보이 등 다양한 댄스 장르 연습에 최적화되어 있습니다. 댄스 동아리와 크루 연습에 많이 사용됩니다.', 1, 4, '09:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('성수 요가 스튜디오',      '서울 성동구 성수일로 55',          '서울', '성동구',   37.5440, 127.0558, 10, 8000,  '성수동 자연채광이 풍부한 감성적인 요가 스튜디오입니다. 하타요가, 빈야사, 음요가 등에 적합하며 요가 매트, 블록, 스트랩 등 용품을 완비하고 있습니다. 소그룹 요가 모임과 명상 클래스에 인기가 높습니다.', 1, 3, '07:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('여의도 필라테스 스튜디오', '서울 영등포구 여의공원로 120',    '서울', '영등포구', 37.5230, 126.9280, 8,  12000, '여의도 공원 인근 필라테스 전문 스튜디오입니다. 리포머, 체어, 바렐 등 전문 기구를 완비하고 있으며 그룹 수업과 개인 레슨 모두 가능합니다. 체형 교정, 코어 강화, 재활 목적으로 활용됩니다.', 1, 3, '07:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('마포 클라이밍 센터',      '서울 마포구 마포대로 130',         '서울', '마포구',   37.5443, 126.9501, 20, 8000,  '마포 실내 클라이밍 전문 센터입니다. 초보자부터 전문 클라이머까지 다양한 난이도의 루트를 갖추고 있으며 안전 장비와 전문 강사의 지도 하에 즐길 수 있습니다. 클라이밍 동호회 모임에 인기 있습니다.', 1, 4, '10:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('종로 탁구 클럽',          '서울 종로구 삼일대로 444',         '서울', '종로구',   37.5700, 126.9834, 20, 5000,  '종로 중심의 쾌적한 탁구 전문 클럽입니다. 전문 탁구 테이블 6대를 갖추고 있으며 취미 동호회부터 동호인 대회 준비까지 활용 가능합니다. 라켓과 공은 기본 제공됩니다.', 1, 4, '10:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('이태원 복싱 짐',          '서울 용산구 보광로 95',            '서울', '용산구',   37.5332, 126.9978, 12, 8000,  '이태원 정통 복싱 훈련 시설입니다. 복싱 링, 샌드백, 스피드백 등 전문 장비를 완비하고 있습니다. 복싱 기초부터 스파링까지 가능하며 복싱 동호회와 건강 운동 모임에 활용됩니다.', 1, 4, '08:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('건대 배드민턴 센터',      '서울 광진구 자양로 65',            '서울', '광진구',   37.5398, 127.0690, 24, 6000,  '건대 인근 실내 배드민턴 전문 센터입니다. 국제 규격 코트 3면을 갖추고 있으며 라켓과 셔틀콕은 기본 제공됩니다. 배드민턴 동호회, 사내 대회, 운동 소셜 모임에 자주 이용됩니다.', 2, 4, '09:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
-- [29-36] 문화/예술
('홍대 아트 스튜디오',      '서울 마포구 홍익로 52',            '서울', '마포구',   37.5543, 126.9244, 12, 10000, '홍대 예술 거리의 창의적인 아트 스튜디오입니다. 회화, 드로잉, 수채화, 아크릴화 등 다양한 미술 활동을 즐길 수 있으며 이젤, 팔레트, 물감, 캔버스 등 모든 재료가 구비되어 있습니다. 미술 동아리와 취미 미술 모임에 적합합니다.', 2, 6, '10:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('성수 포토 스튜디오',      '서울 성동구 성수이로 88',          '서울', '성동구',   37.5452, 127.0555, 8,  20000, '성수동 감성의 전문 포토 스튜디오입니다. 다양한 배경과 조명 장비를 갖추고 있으며 인물 사진, 제품 촬영, 프로필 사진, SNS 컨텐츠 촬영에 최적화되어 있습니다. 카메라 동아리와 사진 모임에 인기 있습니다.', 1, 4, '10:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('종로 음악 연습실',        '서울 종로구 율곡로 55',            '서울', '종로구',   37.5765, 126.9830, 6,  6000,  '종로 중심가의 방음 완벽한 음악 연습실입니다. 피아노, 기타, 드럼, 베이스 등 다양한 악기를 구비하고 있으며 밴드 합주, 개인 악기 연습, 보컬 트레이닝에 활용됩니다. 음악 동아리와 밴드 연습에 자주 이용됩니다.', 1, 4, '10:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('마포 도예 공방',          '서울 마포구 신수동 100',           '서울', '마포구',   37.5474, 126.9416, 8,  12000, '마포 신수동의 아늑한 도예 전문 공방입니다. 도예 물레, 핸드빌딩 도구, 전기 가마를 갖추고 있으며 초보자도 쉽게 도자기 만들기를 배울 수 있습니다. 도예 취미 동아리와 커플 체험 모임에 인기 있습니다.', 2, 4, '10:00:00', '20:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('강남 드로잉 클래스룸',    '서울 강남구 역삼로 152',           '서울', '강남구',   37.4965, 127.0365, 10, 8000,  '강남의 드로잉 전문 클래스룸입니다. 연필, 펜, 마카, 파스텔 등 다양한 재료를 구비하고 있으며 인물화, 일러스트, 캐릭터 디자인 등 다양한 드로잉 수업이 진행됩니다. 그림 그리기 동아리에 활용됩니다.', 2, 4, '10:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('이태원 공예 스튜디오',    '서울 용산구 이태원로 252',         '서울', '용산구',   37.5350, 126.9953, 10, 10000, '이태원 다국적 감성의 공예 스튜디오입니다. 가죽공예, 비즈공예, 매크라메, 자수 등 다양한 핸드메이드 활동이 가능합니다. 공예 취미 모임과 핸드메이드 동아리에 인기 있는 힐링 공간입니다.', 2, 4, '11:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('신촌 영상 제작 스튜디오', '서울 서대문구 신촌로 90',          '서울', '서대문구', 37.5558, 126.9378, 8,  25000, '신촌의 전문 영상 제작 스튜디오입니다. 그린스크린, 조명 장비, 카메라, 편집 워크스테이션을 완비하고 있습니다. 유튜브 컨텐츠 제작, 단편 영화, 뮤직비디오 촬영, 영상 동아리 활동에 최적화된 공간입니다.', 2, 8, '09:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('압구정 플라워 클래스룸',  '서울 강남구 압구정로 345',         '서울', '강남구',   37.5280, 127.0295, 8,  15000, '압구정의 우아한 플라워 클래스룸입니다. 계절 꽃과 전문 도구를 갖추고 있어 꽃꽂이, 꽃다발 만들기, 화환 제작 클래스를 즐길 수 있습니다. 플라워 동아리와 특별한 선물 만들기 소셜 모임에 인기 있습니다.', 2, 4, '10:00:00', '20:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
-- [37-42] 요리/베이킹
('강남 쿠킹 스튜디오',      '서울 강남구 선릉로 200',           '서울', '강남구',   37.5040, 127.0480, 12, 20000, '강남 현직 셰프가 운영하는 전문 쿠킹 스튜디오입니다. 최고급 인덕션과 가스버너, 프로 주방 도구를 완비하고 있으며 한식, 이탈리아식, 프랑스식 등 다양한 요리를 배울 수 있습니다. 요리 동아리와 쿠킹 소셜 클럽에 자주 이용됩니다.', 2, 4, '10:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('홍대 베이킹 클래스',      '서울 마포구 홍익로 30',            '서울', '마포구',   37.5550, 126.9236, 10, 15000, '홍대의 달콤한 베이킹 전문 클래스 공간입니다. 오븐, 믹서기, 제빵 도구를 완비하고 있으며 케이크 데코레이팅, 마카롱, 쿠키, 빵 만들기 등 다양한 수업이 진행됩니다. 베이킹 동아리와 달콤한 소셜 모임에 인기 있습니다.', 2, 4, '10:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('마포 바베큐 파티룸',      '서울 마포구 마포대로 200',         '서울', '마포구',   37.5450, 126.9502, 20, 25000, '마포 야외 공간이 딸린 바베큐 파티룸입니다. 숯불 그릴, 가스 그릴, 야외 테이블을 갖추고 있어 야외에서 고기를 구워 먹으며 파티를 즐길 수 있습니다. 소셜 바베큐 모임과 여름 야외 파티에 특히 인기 있습니다.', 2, 6, '12:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('여의도 요리 교실',        '서울 영등포구 국제금융로 40',      '서울', '영등포구', 37.5220, 126.9257, 12, 18000, '여의도의 체계적인 요리 교실입니다. 실용적인 요리 기술을 실습 위주로 배울 수 있으며 한식, 중식, 일식, 서양식 다양한 메뉴를 다룹니다. 직장인 쿠킹 소셜 클럽과 건강 식단 모임에 활용됩니다.', 2, 4, '10:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('성수 쉐프 테이블',        '서울 성동구 성수동2가 289',        '서울', '성동구',   37.5453, 127.0580, 8,  30000, '성수동 파인다이닝 수준의 쉐프 테이블 공간입니다. 미슐랭 레스토랑 출신 셰프가 운영하며 와인과 함께 즐기는 고급 요리 수업을 제공합니다. 음식 애호가 동아리와 와인 앤 다인 소셜 클럽에 이상적입니다.', 2, 4, '17:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('이태원 월드푸드 쿠킹',    '서울 용산구 이태원로 130',         '서울', '용산구',   37.5342, 126.9951, 10, 20000, '이태원 다국적 음식 문화의 세계 요리 전문 쿠킹 클래스입니다. 태국, 멕시코, 인도, 이탈리아 등 다양한 나라의 요리를 배울 수 있으며 현지 식재료와 향신료도 구비되어 있습니다. 글로벌 음식 동아리에 인기 있습니다.', 2, 4, '11:00:00', '21:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
-- [43-48] 게임/엔터테인먼트
('홍대 보드게임 카페',      '서울 마포구 어울마당로 28',        '서울', '마포구',   37.5530, 126.9228, 20, 5000,  '홍대 보드게임 마니아들의 성지입니다. 500여 종의 보드게임을 갖추고 있으며 처음 하는 사람도 설명을 들으며 즐길 수 있습니다. 보드게임 동아리, 게임 소셜 모임에 완벽한 공간이며 카페음료와 간식도 즐길 수 있습니다.', 2, 8, '12:00:00', '02:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('강남 방탈출 스튜디오',    '서울 강남구 강남대로 390',         '서울', '강남구',   37.4973, 127.0281, 8,  15000, '강남 최고의 몰입형 방탈출 스튜디오입니다. 공포, 미스터리, 판타지 등 다양한 테마로 최첨단 퍼즐과 특수효과로 실제 영화 속에 들어온 듯한 경험을 제공합니다. 팀 빌딩과 특별한 엔터테인먼트 모임에 추천합니다.', 2, 2, '11:00:00', '23:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('건대 VR 체험공간',        '서울 광진구 아차산로 200',         '서울', '광진구',   37.5410, 127.0696, 10, 10000, '건대 최첨단 VR 체험 공간입니다. 최신 VR 헤드셋과 대형 공간을 활용한 풀바디 VR 게임을 즐길 수 있습니다. 다인용 VR 대전게임, VR 스포츠, VR 어드벤처 등 다양한 콘텐츠를 제공합니다. 게임 동아리와 팀 빌딩 행사에 인기 있습니다.', 2, 4, '11:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('마포 노래방 프라이빗 룸', '서울 마포구 어울마당로 100',       '서울', '마포구',   37.5490, 126.9220, 12, 8000,  '합정 최고급 프라이빗 노래방입니다. 완벽한 방음, 최고의 음향 시스템, 4K 영상 장비로 완전히 독립된 공간에서 노래를 즐길 수 있습니다. 반주 악기도 갖추고 있어 노래 동아리와 친목 파티에 인기 있습니다.', 2, 6, '12:00:00', '04:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('신촌 당구장',             '서울 서대문구 신촌로 126',         '서울', '서대문구', 37.5558, 126.9390, 16, 4000,  '신촌 대학가의 쾌적한 당구 전문 공간입니다. 4구, 3구, 포켓볼 테이블을 갖추고 있으며 당구 동아리와 취미 모임에 자주 이용됩니다. 학생들과 직장인 모두에게 인기 있는 합리적인 가격의 공간입니다.', 1, 6, '10:00:00', '02:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('종로 전통 게임 공간',     '서울 종로구 삼청로 88',            '서울', '종로구',   37.5820, 126.9800, 12, 6000,  '종로 삼청동의 한국 전통 보드게임 전문 공간입니다. 바둑, 장기, 윷놀이, 고스톱, 전통 주사위 게임 등 한국 전통 게임을 즐길 수 있습니다. 전통 문화 동아리와 외국인 한국 문화 체험 모임에 인기 있습니다.', 2, 6, '10:00:00', '20:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
-- [49-50] 야외/특별
('한강 야외 피크닉 공간',   '서울 영등포구 여의동로 330',       '서울', '영등포구', 37.5174, 126.9328, 50, 10000, '여의도 한강공원 내 예약제 야외 피크닉 공간입니다. 한강을 바라보며 피크닉, 바베큐, 야외 파티를 즐길 수 있습니다. 돗자리, 파라솔, 간이 그릴이 제공되며 야외 소셜 모임과 봄 피크닉 행사에 이상적입니다.', 2, 8, '09:00:00', '22:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('북한산 트레킹 베이스캠프','서울 강북구 우이동 산1-1',         '서울', '강북구',   37.6609, 126.9764, 30, 5000,  '북한산 등산로 입구의 트레킹 베이스캠프입니다. 등산 장비 대여, 등산 지도, 안전 브리핑을 제공하며 트레킹 후 휴식 쉼터도 갖추고 있습니다. 등산 동호회와 아웃도어 소셜 클럽에 적합한 자연 속 힐링 공간입니다.', 2, 6, '06:00:00', '18:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- 4. 장소-태그 연결
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '강남 집중 스터디룸'      AND t.name IN ('스터디','조용한','집중력향상','방음','와이파이','에어컨','역세권','프라이빗');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '홍대 코워킹 스페이스'    AND t.name IN ('회의','모던한','코딩','와이파이','프레젠테이션','역세권','활기찬','팀빌딩','소셜모임');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '성수 스마트 오피스'      AND t.name IN ('회의','팀빌딩','워크샵','빔프로젝터','화이트보드','스크린','인스타감성','모던한');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '여의도 비즈니스 센터'    AND t.name IN ('회의','기업행사','프레젠테이션','화이트보드','미니멀한','럭셔리','에어컨','역세권','음향장비');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '종로 조용한 독서실'      AND t.name IN ('독서','스터디','조용한','집중력향상','자격증','24시간','방음','에어컨','소규모');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '마포 스터디 카페'        AND t.name IN ('스터디','언어학습','카페음료','커피머신','와이파이','아늑한','캐주얼','역세권');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '건대 그룹 스터디룸'      AND t.name IN ('그룹스터디','스터디','화이트보드','빔프로젝터','자격증','코딩','역세권','조용한');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '신촌 프리미엄 독서실'    AND t.name IN ('독서','자격증','집중력향상','조용한','방음','미니멀한','역세권','에어컨','소규모');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '압구정 프라이빗 오피스'  AND t.name IN ('회의','럭셔리','프라이빗','기업행사','에어컨','도심뷰','미니멀한','소규모');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '이태원 글로벌 코워킹'    AND t.name IN ('언어학습','회의','와이파이','코딩','소셜모임','역세권','활기찬','모던한');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '강남 럭셔리 파티룸'      AND t.name IN ('파티','생일파티','럭셔리','음향장비','조명','케이터링','소셜모임','댄스','활기찬','대형');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '홍대 인스타 파티룸'      AND t.name IN ('파티','생일파티','인스타감성','조명','소셜모임','활기찬','사진','주류');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '성수 빈티지 파티룸'      AND t.name IN ('파티','빈티지','소셜모임','주류','조명','인스타감성','친목','동아리');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '한남 루프탑 파티공간'    AND t.name IN ('파티','루프탑','도심뷰','바베큐','야외','주류','소셜모임','기업행사','케이터링','대형');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '이태원 프라이빗 파티룸'  AND t.name IN ('파티','프라이빗','주류','소셜모임','음향장비','활기찬','친목');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '마포 생일파티 전용룸'    AND t.name IN ('생일파티','아기자기한','소규모','파티','사진','친목','커플');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '여의도 한강뷰 파티룸'    AND t.name IN ('파티','한강뷰','럭셔리','기업행사','돌잔치','대형','케이터링','조명');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '종로 레트로 파티룸'      AND t.name IN ('파티','빈티지','친목','동아리','소셜모임','캐주얼','음향장비');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '압구정 VIP 파티룸'       AND t.name IN ('파티','럭셔리','프라이빗','기업행사','케이터링','음향장비','조명','대형');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '건대 소셜 파티룸'        AND t.name IN ('파티','소셜모임','동아리','보드게임','파티게임','캐주얼','활기찬','친목');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '강남 프리미엄 헬스장'    AND t.name IN ('헬스','스트레칭','샤워실','모던한','소셜모임','역세권','에어컨');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '홍대 댄스 스튜디오'      AND t.name IN ('댄스','음향장비','조명','동아리','창작','활기찬','공연');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '성수 요가 스튜디오'      AND t.name IN ('요가','스트레칭','자연채광','조용한','소규모','금연','친환경','아늑한');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '여의도 필라테스 스튜디오' AND t.name IN ('필라테스','스트레칭','소규모','금연','조용한','역세권');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '마포 클라이밍 센터'      AND t.name IN ('클라이밍','동아리','활기찬','샤워실','소셜모임','팀빌딩');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '종로 탁구 클럽'          AND t.name IN ('탁구','동아리','소셜모임','캐주얼','활기찬','역세권');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '이태원 복싱 짐'          AND t.name IN ('복싱','헬스','스트레칭','샤워실','소셜모임','동아리');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '건대 배드민턴 센터'      AND t.name IN ('배드민턴','동아리','소셜모임','활기찬','역세권','대형');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '홍대 아트 스튜디오'      AND t.name IN ('미술','드로잉','창작','동아리','인스타감성','자연채광','소규모');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '성수 포토 스튜디오'      AND t.name IN ('사진','인스타감성','조명','창작','동아리','모던한','웨딩촬영');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '종로 음악 연습실'        AND t.name IN ('음악','악기연습','악기대여','방음','밴드','동아리','창작','공연');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '마포 도예 공방'          AND t.name IN ('도예','공예','창작','아늑한','소규모','동아리','친환경','커플');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '강남 드로잉 클래스룸'    AND t.name IN ('드로잉','미술','창작','동아리','소규모','강의');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '이태원 공예 스튜디오'    AND t.name IN ('공예','창작','동아리','아늑한','소규모','커플');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '신촌 영상 제작 스튜디오' AND t.name IN ('영상제작','사진','창작','동아리','조명','음향장비','방음');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '압구정 플라워 클래스룸'  AND t.name IN ('공예','창작','아늑한','럭셔리','소규모','커플','친환경');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '강남 쿠킹 스튜디오'      AND t.name IN ('요리실습','주방','동아리','소셜모임','강의','팀빌딩');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '홍대 베이킹 클래스'      AND t.name IN ('베이킹','요리실습','주방','동아리','소셜모임','간식','아늑한','커플');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '마포 바베큐 파티룸'      AND t.name IN ('바베큐','야외','파티','소셜모임','주류','동아리','활기찬','주방');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '여의도 요리 교실'        AND t.name IN ('요리실습','주방','강의','동아리','소셜모임','채식');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '성수 쉐프 테이블'        AND t.name IN ('요리실습','와인','주방','럭셔리','소규모','프라이빗','카페음료');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '이태원 월드푸드 쿠킹'    AND t.name IN ('요리실습','주방','동아리','소셜모임','캐주얼','강의','채식');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '홍대 보드게임 카페'      AND t.name IN ('보드게임','게임','파티게임','카페음료','간식','동아리','소셜모임','캐주얼','활기찬');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '강남 방탈출 스튜디오'    AND t.name IN ('방탈출','게임','팀빌딩','소셜모임','동아리','활기찬');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '건대 VR 체험공간'        AND t.name IN ('VR','게임','팀빌딩','동아리','소셜모임','활기찬','모던한');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '마포 노래방 프라이빗 룸' AND t.name IN ('노래방','음악','방음','음향장비','마이크','파티','친목','프라이빗');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '신촌 당구장'             AND t.name IN ('당구','게임','동아리','캐주얼','소셜모임','역세권');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '종로 전통 게임 공간'     AND t.name IN ('보드게임','게임','전통','동아리','소셜모임','가족','아늑한');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '한강 야외 피크닉 공간'   AND t.name IN ('야외','한강뷰','바베큐','소셜모임','친목','동아리','친환경','가족','활기찬');
INSERT INTO place_tag (place_id, tag_id) SELECT p.id, t.id FROM place p, tag t WHERE p.name = '북한산 트레킹 베이스캠프' AND t.name IN ('야외','친환경','동아리','소셜모임','가족','스트레칭','자연채광');

-- 5. 장소 리뷰 (장소별 0~5개, 각 장소 특성에 맞게)
-- 강남 집중 스터디룸 (4개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '조용하고 집중하기 딱 좋아요. 방음도 완벽하고 와이파이도 빨라서 코딩 스터디에 자주 이용합니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 집중 스터디룸' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '강남역에서 가깝고 시설이 깔끔합니다. 영어 스터디 모임에 딱이에요. 다음에도 이용할 것 같아요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 집중 스터디룸' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '자격증 준비하면서 자주 이용했어요. 개인 조명이 있어서 눈이 편하고 공부에 집중이 잘 됩니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 집중 스터디룸' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '그룹 독서 모임으로 사용했는데 완벽한 조용함이 유지되어 좋았습니다. 주차가 아쉽네요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 집중 스터디룸' AND u.email='tester4@moa.com';
-- 홍대 코워킹 스페이스 (3개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '스타트업 팀 미팅에 사용했어요. 고속 와이파이와 회의실 시설이 너무 좋아요. 네트워킹 행사도 자주 열려요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 코워킹 스페이스' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, 'IT 개발 팀 작업공간으로 사용했는데 코딩하기 좋은 환경이에요. 분위기도 트렌디하고 좋습니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 코워킹 스페이스' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '프리랜서로 작업하기 좋은 공간이에요. 다양한 업계 사람들과 자연스럽게 네트워킹도 됩니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 코워킹 스페이스' AND u.email='tester5@moa.com';
-- 강남 럭셔리 파티룸 (5개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '생일 파티로 이용했는데 시설이 정말 최고예요! 음향 시스템이 완벽하고 조명도 너무 예쁩니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 럭셔리 파티룸' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '회사 송년 파티로 사용했습니다. 케이터링 서비스 연계가 편리하고 공간이 넓어서 30명도 여유로워요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 럭셔리 파티룸' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, 'DJ 부스와 댄스 플로어가 있어서 진짜 파티 느낌 납니다. 가격이 좀 있지만 그만한 가치가 있어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 럭셔리 파티룸' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '소셜 모임 행사로 이용했어요. 강남에서 이 가격에 이런 시설 쉽지 않아요. 다시 이용할 거예요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 럭셔리 파티룸' AND u.email='tester4@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '친구 깜짝 파티에 완벽했어요. 스태프분들이 친절하게 도와주셔서 행사 준비가 수월했습니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 럭셔리 파티룸' AND u.email='tester5@moa.com';
-- 홍대 인스타 파티룸 (3개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '인스타 감성 사진 진짜 잘 나와요! 조명이 너무 예쁘고 포토 스팟이 많아서 다들 좋아했어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 인스타 파티룸' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '생일 파티에 이용했는데 홍대 위치도 좋고 SNS 올리기 딱 좋은 분위기예요. 다음에 또 이용할게요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 인스타 파티룸' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '블루투스 스피커 음질이 좋아서 파티 내내 신났어요. 공간이 아담해서 소규모 모임에 딱 맞아요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 인스타 파티룸' AND u.email='tester5@moa.com';
-- 한남 루프탑 파티공간 (4개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '서울 뷰가 정말 환상적이에요! 야경 보면서 바베큐 파티를 즐기는 경험은 잊을 수가 없어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한남 루프탑 파티공간' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '기업 리셉션 행사로 이용했는데 외부 손님들 반응이 최고였어요. 도심뷰가 정말 인상적입니다.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한남 루프탑 파티공간' AND u.email='tester4@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '야외 공간이라 날씨 좋은 날엔 최고예요. 칵테일 파티로 이용했는데 분위기가 정말 럭셔리해요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한남 루프탑 파티공간' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '소셜 이벤트로 이용했는데 모두가 감탄했어요. 한남 뷰가 이렇게 아름다운 줄 몰랐어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한남 루프탑 파티공간' AND u.email='tester3@moa.com';
-- 홍대 댄스 스튜디오 (4개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '힙합 크루 연습실로 정기 이용 중이에요. 스프링 바닥 덕분에 무릎 부담이 없고 음향이 정말 최고예요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 댄스 스튜디오' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '케이팝 댄스 동아리에서 자주 이용해요. 전면 거울이 연습하기에 딱 좋고 조명도 멋있어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 댄스 스튜디오' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '팝핀 연습을 여기서 처음 시작했어요. 바닥이 좋아서 슬라이딩 동작하기 편하고 깨끗해요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 댄스 스튜디오' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '댄스 공연 전 최종 리허설 장소로 이용했어요. 공연 준비에 딱 맞는 환경이에요. 강력 추천합니다!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 댄스 스튜디오' AND u.email='tester5@moa.com';
-- 성수 요가 스튜디오 (3개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '요가 소모임으로 매주 이용하고 있어요. 자연채광이 풍부하고 조용해서 명상하기에도 완벽한 공간이에요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='성수 요가 스튜디오' AND u.email='tester4@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '빈야사 요가 동아리로 이용했어요. 매트, 블록 다 구비되어 있고 환경이 정말 평화로워요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='성수 요가 스튜디오' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '성수동 분위기랑 잘 어울리는 감성적인 공간이에요. 친환경 소재 사용하는 것도 마음에 들어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='성수 요가 스튜디오' AND u.email='tester1@moa.com';
-- 마포 도예 공방 (3개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '도예 동아리 모임으로 이용했어요. 물레 체험이 생각보다 재밌어요! 강사분이 친절하게 알려주셔요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='마포 도예 공방' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '커플로 도예 체험 왔는데 둘이 함께하기 너무 좋았어요. 아늑한 분위기가 정말 마음에 들어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='마포 도예 공방' AND u.email='tester5@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '공예 취미 동아리에서 단체로 이용했어요. 창작 활동이라 다들 집중하며 즐거운 시간을 보냈어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='마포 도예 공방' AND u.email='tester1@moa.com';
-- 강남 쿠킹 스튜디오 (4개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '요리 동아리에서 한식 클래스로 이용했어요. 셰프님 설명이 친절하고 시설이 프로급이에요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 쿠킹 스튜디오' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '팀 빌딩 요리 이벤트로 이용했어요. 요리 경험이 없는 팀원도 쉽게 따라할 수 있어서 대성공이었어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 쿠킹 스튜디오' AND u.email='tester4@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '쿠킹 소셜 클럽으로 이탈리아 요리 클래스를 했어요. 파스타 만들기 너무 재밌고 맛도 좋았어요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 쿠킹 스튜디오' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '고급 주방 도구들이 다 갖춰져 있어서 진짜 프로처럼 요리할 수 있어요. 강추합니다!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='강남 쿠킹 스튜디오' AND u.email='tester3@moa.com';
-- 홍대 베이킹 클래스 (2개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '베이킹 동아리에서 마카롱 클래스로 이용했어요. 오븐 시설이 좋고 재료도 신선해서 맛있게 완성됐어요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 베이킹 클래스' AND u.email='tester5@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '커플 베이킹 체험으로 이용했는데 케이크 만들기 너무 즐거웠어요. 다음엔 빵 만들기도 해보고 싶어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 베이킹 클래스' AND u.email='tester2@moa.com';
-- 홍대 보드게임 카페 (5개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '보드게임 동아리 정기 모임 장소로 딱이에요! 500종이나 있어서 매번 새로운 게임을 즐길 수 있어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 보드게임 카페' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '처음 온 사람도 직원분이 게임 설명해줘서 어렵지 않아요. 음료도 맛있고 가격도 합리적이에요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 보드게임 카페' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '친목 소셜 모임으로 이용했는데 다들 너무 즐거워했어요. 게임 하다 보니 금방 친해지더라고요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 보드게임 카페' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '다양한 보드게임이 있어서 모임 사람들 취향에 맞게 고를 수 있어요. 간식도 맛있고 완벽했어요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 보드게임 카페' AND u.email='tester4@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '동아리 MT 대신 이용했는데 대박이었어요. 파티게임도 있어서 깔깔 웃으며 시간 가는 줄 몰랐어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='홍대 보드게임 카페' AND u.email='tester5@moa.com';
-- 종로 음악 연습실 (3개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '밴드 합주 연습으로 이용했어요. 방음이 완벽해서 신경 쓰지 않고 마음껏 연주할 수 있었어요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='종로 음악 연습실' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '음악 동아리에서 정기 이용 중이에요. 다양한 악기가 구비되어 있고 연주하기 편한 환경이에요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='종로 음악 연습실' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '보컬 레슨 스터디에 이용했어요. 마이크 시설이 훌륭하고 종로 위치가 교통도 편리해요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='종로 음악 연습실' AND u.email='tester4@moa.com';
-- 마포 바베큐 파티룸 (2개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '동아리 여름 파티로 이용했어요. 야외에서 바베큐 먹으면서 노는 건 최고죠! 그릴 시설도 좋아요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='마포 바베큐 파티룸' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '소셜 바베큐 모임으로 이용했는데 야외 공간이 넓어서 편했어요. 주류 반입 가능한 것도 좋아요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='마포 바베큐 파티룸' AND u.email='tester5@moa.com';
-- 한강 야외 피크닉 공간 (3개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '한강뷰 보며 소셜 피크닉 모임을 했어요. 돗자리와 파라솔 제공되어서 편하고 자연 속에서 힐링했어요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한강 야외 피크닉 공간' AND u.email='tester1@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '동아리 봄 소풍으로 이용했어요. 한강 바람 맞으며 피크닉하는 경험 최고예요. 바베큐도 맛있었어요!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한강 야외 피크닉 공간' AND u.email='tester3@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '야외 소셜 이벤트로 이용했는데 가족 친화적인 분위기가 좋았어요. 아이들도 뛰어놀 공간이 충분해요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='한강 야외 피크닉 공간' AND u.email='tester4@moa.com';
-- 북한산 트레킹 베이스캠프 (2개)
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 5, '등산 동호회에서 이용했어요. 장비 대여 서비스가 편리하고 트레킹 후 쉼터에서 쉬는 것도 좋았어요.', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='북한산 트레킹 베이스캠프' AND u.email='tester2@moa.com';
INSERT INTO place_review (rating, comment, place_id, user_id, reservation_id) SELECT 4, '아웃도어 소셜 클럽에서 처음 이용했어요. 자연 속에서 힐링하는 느낌이 도심과 완전 달라요. 강추!', p.id, u.user_id, NULL FROM place p, users u WHERE p.name='북한산 트레킹 베이스캠프' AND u.email='tester5@moa.com';
