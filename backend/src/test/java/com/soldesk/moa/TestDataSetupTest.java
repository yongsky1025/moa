package com.soldesk.moa;

import com.soldesk.moa.circle.entity.*;
import com.soldesk.moa.circle.entity.constant.*;
import com.soldesk.moa.circle.repository.*;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.Tag;
import com.soldesk.moa.place.entity.TagCategory;
import com.soldesk.moa.place.repository.PlaceRepository;
import com.soldesk.moa.place.repository.TagCategoryRepository;
import com.soldesk.moa.place.repository.PlaceTagRepository;
import com.soldesk.moa.place.repository.TagRepository;
import com.soldesk.moa.users.entity.*;
import com.soldesk.moa.users.entity.constant.*;
import com.soldesk.moa.users.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 시연용 테스트 데이터 생성
 * 실행: 해당 테스트 메서드만 단독 실행 (IDE에서 우클릭 → Run)
 * 중복 실행 안전: 이미 존재하는 데이터는 건너뜀
 */
@ActiveProfiles("local")
@SpringBootTest
public class TestDataSetupTest {

    @Autowired private PlaceRepository placeRepository;
    @Autowired private TagCategoryRepository tagCategoryRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private PlaceTagRepository placeTagRepository;
    @Autowired private UsersRepository usersRepository;
    @Autowired private UsersEnergyProfileRepository usersEnergyProfileRepository;
    @Autowired private CircleCategoryRepository categoryRepository;
    @Autowired private CircleRepository circleRepository;
    @Autowired private CircleEnergyProfileRepository circleEnergyProfileRepository;
    @Autowired private CircleMemberRepository circleMemberRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // 고정 시드 → 언제 실행해도 같은 데이터 생성
    private final Random rng = new Random(42);

    @Commit
    @Test
    void addEnergyProfileToUser1() {
        Users user = usersRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("userId=1 유저 없음"));

        boolean alreadyExists = usersEnergyProfileRepository.findAll().stream()
            .anyMatch(ep -> ep.getUser().getUserId().equals(1L));

        if (alreadyExists) {
            System.out.println("이미 에너지 프로필이 존재합니다.");
            return;
        }

        usersEnergyProfileRepository.save(UsersEnergyProfile.builder()
            .user(user)
            .socialLoad(3)
            .interactionMode(4)
            .structureLevel(2)
            .activityIntensity(4)
            .commitmentLevel(3)
            .energyType(EnergyType.classify(3, 4, 4))
            .build());

        System.out.println("✅ userId=1 에너지 프로필 생성 완료");
    }

    @Commit
    @Test
    void resetAndSeedTags() {
        // 기존 태그 관련 데이터 전부 삭제 (순서 중요: FK 참조 먼저)
        placeTagRepository.deleteAll();
        tagRepository.deleteAll();
        tagCategoryRepository.deleteAll();
        System.out.println("🗑️ 기존 태그 데이터 삭제 완료");

        // 카테고리 생성
        Object[][] categoryData = {
            {"공간 유형", 1},
            {"시설/장비", 2},
            {"분위기", 3},
            {"활동 목적", 4},
            {"모임 규모", 5},
            {"접근성", 6},
            {"주변 환경", 7},
            {"음식/음료", 8},
        };

        Map<String, TagCategory> tagCatMap = new HashMap<>();
        for (Object[] c : categoryData) {
            TagCategory saved = tagCategoryRepository.save(TagCategory.builder()
                .name((String) c[0])
                .sortOrder((Integer) c[1])
                .build());
            tagCatMap.put(saved.getName(), saved);
        }

        // 태그 생성
        String[][] tagData = {
            // ── 공간 유형 (22개)
            {"공간 유형", "카페"}, {"공간 유형", "스튜디오"}, {"공간 유형", "세미나실"},
            {"공간 유형", "파티룸"}, {"공간 유형", "연습실"}, {"공간 유형", "공유오피스"},
            {"공간 유형", "야외공간"}, {"공간 유형", "운동시설"}, {"공간 유형", "한옥"},
            {"공간 유형", "갤러리"}, {"공간 유형", "공연장"}, {"공간 유형", "루프탑"},
            {"공간 유형", "공유주방"}, {"공간 유형", "캠핑장"}, {"공간 유형", "볼링장"},
            {"공간 유형", "풋살장"}, {"공간 유형", "클라이밍짐"}, {"공간 유형", "요가/필라테스"},
            {"공간 유형", "바베큐장"}, {"공간 유형", "보드게임카페"}, {"공간 유형", "독립서점"},
            {"공간 유형", "복합문화공간"},

            // ── 시설/장비 (22개)
            {"시설/장비", "빔프로젝터"}, {"시설/장비", "화이트보드"}, {"시설/장비", "주차장"},
            {"시설/장비", "음향장비"}, {"시설/장비", "주방시설"}, {"시설/장비", "와이파이"},
            {"시설/장비", "에어컨"}, {"시설/장비", "샤워시설"}, {"시설/장비", "거울벽"},
            {"시설/장비", "TV/모니터"}, {"시설/장비", "마이크"}, {"시설/장비", "조명장비"},
            {"시설/장비", "그릴/바베큐"}, {"시설/장비", "냉장고"}, {"시설/장비", "전자레인지"},
            {"시설/장비", "정수기"}, {"시설/장비", "탈의실"}, {"시설/장비", "락커"},
            {"시설/장비", "콘센트다수"}, {"시설/장비", "블루투스스피커"}, {"시설/장비", "보드게임구비"},
            {"시설/장비", "포토존"},

            // ── 분위기 (16개)
            {"분위기", "모던"}, {"분위기", "아늑함"}, {"분위기", "넓은공간"},
            {"분위기", "야외"}, {"분위기", "조용함"}, {"분위기", "빈티지"},
            {"분위기", "자연친화"}, {"분위기", "고급스러움"}, {"분위기", "캐주얼"},
            {"분위기", "화려함"}, {"분위기", "심플"}, {"분위기", "따뜻한조명"},
            {"분위기", "인더스트리얼"}, {"분위기", "한옥느낌"}, {"분위기", "감성적"},
            {"분위기", "깔끔함"},

            // ── 활동 목적 (28개)
            {"활동 목적", "회의"}, {"활동 목적", "촬영"}, {"활동 목적", "파티"},
            {"활동 목적", "스터디"}, {"활동 목적", "공연"}, {"활동 목적", "워크숍"},
            {"활동 목적", "운동"}, {"활동 목적", "요리"}, {"활동 목적", "보드게임"},
            {"활동 목적", "독서모임"}, {"활동 목적", "생일파티"}, {"활동 목적", "동창회"},
            {"활동 목적", "팀빌딩"}, {"활동 목적", "세미나"}, {"활동 목적", "강연"},
            {"활동 목적", "전시"}, {"활동 목적", "플리마켓"}, {"활동 목적", "버스킹"},
            {"활동 목적", "댄스"}, {"활동 목적", "요가/명상"}, {"활동 목적", "영화감상"},
            {"활동 목적", "음악연습"}, {"활동 목적", "수공예"}, {"활동 목적", "그림/드로잉"},
            {"활동 목적", "피크닉"}, {"활동 목적", "네트워킹"}, {"활동 목적", "번개모임"},
            {"활동 목적", "정기모임"},

            // ── 모임 규모 (5개)
            {"모임 규모", "소규모(~10명)"}, {"모임 규모", "중규모(11~30명)"},
            {"모임 규모", "대규모(31~50명)"}, {"모임 규모", "대형(51~100명)"},
            {"모임 규모", "초대형(100명+)"},

            // ── 접근성 (6개)
            {"접근성", "역세권"}, {"접근성", "주차편리"}, {"접근성", "대중교통편리"},
            {"접근성", "엘리베이터"}, {"접근성", "장애인편의시설"}, {"접근성", "1층위치"},

            // ── 주변 환경 (9개)
            {"주변 환경", "한강뷰"}, {"주변 환경", "산뷰"}, {"주변 환경", "도심뷰"},
            {"주변 환경", "공원인접"}, {"주변 환경", "맛집밀집"}, {"주변 환경", "카페거리"},
            {"주변 환경", "쇼핑가인접"}, {"주변 환경", "자연속"}, {"주변 환경", "조용한주택가"},

            // ── 음식/음료 (7개)
            {"음식/음료", "음식반입가능"}, {"음식/음료", "음주가능"}, {"음식/음료", "케이터링가능"},
            {"음식/음료", "커피머신"}, {"음식/음료", "취사가능"}, {"음식/음료", "배달수령가능"},
            {"음식/음료", "음료제공"},
        };

        int tagCount = 0;
        for (String[] t : tagData) {
            TagCategory category = tagCatMap.get(t[0]);
            if (category == null) continue;
            tagRepository.save(Tag.builder()
                .name(t[1])
                .tagCategory(category)
                .build());
            tagCount++;
        }

        System.out.println("✅ 태그 시드 데이터 생성 완료!");
        System.out.println("   - 카테고리: " + tagCatMap.size() + "개");
        System.out.println("   - 태그: " + tagCount + "개");
    }

    private int rand(int min, int max) {
        return min + rng.nextInt(max - min + 1);
    }

    @Commit
    @Test
    void setupTestData() {

        // ── 1. 카테고리 12개 ────────────────────────────────────────
        String[] categoryNames = {
            "운동", "동네친구", "아웃도어/여행", "자기계발",
            "가족/육아", "반려동물", "음식/음료", "취미/오락",
            "독서/인문학", "문화/예술", "음악/악기", "기타"
        };

        Map<String, CircleCategory> catMap = categoryRepository.findAll().stream()
            .collect(Collectors.toMap(CircleCategory::getCategoryName, c -> c));

        for (String name : categoryNames) {
            if (!catMap.containsKey(name)) {
                CircleCategory saved = categoryRepository.save(
                    CircleCategory.builder().categoryName(name).build()
                );
                catMap.put(name, saved);
            }
        }

        // ── 2. 유저 100명 + 에너지 프로필 ──────────────────────────
        String[] surnames = {
            "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
            "한", "오", "서", "신", "권", "황", "안", "송", "류", "전"
        };
        String[] maleNames = {
            "민준", "서준", "도윤", "예준", "시우", "주원", "하준", "지호",
            "준서", "준혁", "현우", "도현", "민재", "연우", "우진", "지훈",
            "승현", "재원", "동현", "성민", "태양", "진우", "재혁", "민호",
            "성준", "현진", "정우", "승민", "태민", "기현"
        };
        String[] femaleNames = {
            "서연", "서윤", "지우", "지유", "하은", "하윤", "민서", "지아",
            "채원", "수아", "예은", "예린", "지현", "세아", "연서", "지원",
            "은서", "수연", "아린", "예나", "민지", "소연", "유진", "나연",
            "지영", "수현", "혜진", "미래", "소희", "다은"
        };

        String encodedPw = passwordEncoder.encode("1234");
        List<Users> userList = new ArrayList<>();

        for (int i = 1; i <= 100; i++) {
            String email = "test" + i + "@moa.com";
            Optional<Users> existing = usersRepository.findByEmail(email);
            if (existing.isPresent()) {
                userList.add(existing.get());
                continue;
            }

            boolean isMale = rng.nextBoolean();
            UserGender gender = isMale ? UserGender.MALE : UserGender.FEMALE;
            String fullName = surnames[rng.nextInt(surnames.length)]
                + (isMale ? maleNames[rng.nextInt(maleNames.length)]
                          : femaleNames[rng.nextInt(femaleNames.length)]);

            Users user = Users.builder()
                .name(fullName)
                .email(email)
                .password(encodedPw)
                .nickname("moa_" + i + "_" + fullName)
                .birthDate(LocalDate.of(rand(1980, 2003), rand(1, 12), rand(1, 28)))
                .userRole(UserRole.USER)
                .userGender(gender)
                .provider(AuthProvider.LOCAL)
                .privacyAgreedAt(LocalDateTime.now())
                .onboardingCompletedAt(LocalDateTime.now())
                .build();

            Users saved = usersRepository.save(user);
            userList.add(saved);

            int sl = rand(1, 5), im = rand(1, 5), ai = rand(1, 5);
            usersEnergyProfileRepository.save(UsersEnergyProfile.builder()
                .user(saved)
                .socialLoad(sl)
                .interactionMode(im)
                .structureLevel(rand(1, 5))
                .activityIntensity(ai)
                .commitmentLevel(rand(1, 5))
                .energyType(EnergyType.classify(sl, im, ai))
                .build());
        }

        // ── 3. 서클 20개 + 에너지 프로필 + 리더 ────────────────────
        // { 서클명, 설명, 카테고리명 }
        String[][] circleData = {
            {"주말 러닝 모임",     "한강공원에서 함께 달리며 건강을 챙겨요! 페이스 무관 환영.",       "운동"},
            {"헬스 같이해요",      "서로 동기부여하며 몸을 만들어봐요. 초보자도 환영!",              "운동"},
            {"우리동네 친구 만들기","같은 동네 사는 친구들과 편하게 어울려요.",                      "동네친구"},
            {"산책 메이트",        "저녁마다 동네 한 바퀴! 가볍게 걸으며 수다 떨어요.",             "동네친구"},
            {"주말 등산 클럽",     "매주 다른 산을 올라요. 서울 근교 명산 탐방!",                   "아웃도어/여행"},
            {"백패킹 어드벤처",    "짐 메고 자연 속으로! 1박 2일 백패킹 모임.",                     "아웃도어/여행"},
            {"새벽 독서 클럽",     "매일 아침 30분 독서 인증. 함께라면 꾸준히 할 수 있어요.",       "자기계발"},
            {"스터디 메이트",      "목표 세우고 함께 공부해요. 서로 응원하는 스터디 그룹.",          "자기계발"},
            {"육아 공유 모임",     "육아 정보와 경험을 나눠요. 아이 키우는 부모님 모여요!",          "가족/육아"},
            {"아이들과 함께",      "아이들과 즐길 수 있는 나들이·활동을 함께 기획해요.",             "가족/육아"},
            {"강아지 산책 친구",   "강아지와 함께 산책하는 모임. 반려견 친구도 사귀어요!",           "반려동물"},
            {"고양이 집사 모임",   "고양이 키우는 집사들의 수다 모임. 사진 자랑 필수!",             "반려동물"},
            {"맛집 탐방대",        "서울 곳곳 숨은 맛집을 함께 탐방해요. 매주 새 도전!",            "음식/음료"},
            {"홈쿠킹 클럽",        "집에서 요리를 배우고 레시피를 공유해요.",                        "음식/음료"},
            {"보드게임 모임",      "다양한 보드게임을 함께 즐겨요. 초보자도 환영!",                  "취미/오락"},
            {"사진 찍는 사람들",   "카메라 들고 서울 골목 구석구석을 누벼요.",                       "취미/오락"},
            {"독서 토론 클럽",     "한 달에 한 권, 함께 읽고 생각을 나눠요.",                        "독서/인문학"},
            {"미술관 투어",        "서울의 갤러리와 미술관을 함께 관람해요.",                         "문화/예술"},
            {"기타 연주 모임",     "기타를 배우거나 함께 연주하고 싶은 분들 모여요!",                 "음악/악기"},
            {"다양한 취미 모임",   "특별한 카테고리에 없는 취미를 가진 분들의 자유로운 모임.",        "기타"},
        };

        Map<String, Circle> existingCircles = circleRepository.findAll().stream()
            .collect(Collectors.toMap(Circle::getName, c -> c));

        List<Circle> circleList = new ArrayList<>();

        for (int i = 0; i < circleData.length; i++) {
            String circleName = circleData[i][0];

            if (existingCircles.containsKey(circleName)) {
                circleList.add(existingCircles.get(circleName));
                continue;
            }

            Circle circle = Circle.builder()
                .name(circleName)
                .description(circleData[i][1])
                .status(CircleStatus.OPEN)
                .maxMember(rand(10, 30))
                .currentMember(0)
                .category(catMap.get(circleData[i][2]))
                .build();

            Circle saved = circleRepository.save(circle);
            circleList.add(saved);

            // 서클 에너지 프로필
            circleEnergyProfileRepository.save(CircleEnergyProfile.builder()
                .circle(saved)
                .socialLoad(rand(1, 5))
                .interactionMode(rand(1, 5))
                .structureLevel(rand(1, 5))
                .activityIntensity(rand(1, 5))
                .commitmentLevel(rand(1, 5))
                .build());

            // i번째 유저를 리더로 등록
            Users leader = userList.get(i);
            boolean leaderExists = circleMemberRepository.existsByCircleAndUserAndStatusIn(
                saved, leader,
                List.of(CircleMemberStatus.ACTIVE, CircleMemberStatus.PENDING)
            );
            if (!leaderExists) {
                circleMemberRepository.save(CircleMember.builder()
                    .user(leader)
                    .circle(saved)
                    .role(CircleRole.LEADER)
                    .status(CircleMemberStatus.ACTIVE)
                    .build());
            }
        }

        // ── 4. 랜덤 멤버 90명 가입 (정원 내 ACTIVE / 초과 시 PENDING) ──────
        // 서클별 현재 ACTIVE 인원 추적 (리더 1명씩 포함)
        Map<Long, Integer> activeCountMap = new HashMap<>();
        for (Circle circle : circleList) {
            activeCountMap.put(circle.getCircleId(), 1); // 리더 1명
        }

        List<Users> shuffled = new ArrayList<>(userList);
        Collections.shuffle(shuffled, rng);
        List<Users> toJoin = shuffled.subList(0, 90);

        for (Users member : toJoin) {
            int numCircles = rand(1, 3);
            List<Circle> shuffledCircles = new ArrayList<>(circleList);
            Collections.shuffle(shuffledCircles, rng);

            int count = 0;
            for (Circle circle : shuffledCircles) {
                if (count >= numCircles) break;

                boolean already = circleMemberRepository.existsByCircleAndUserAndStatusIn(
                    circle, member,
                    List.of(CircleMemberStatus.ACTIVE, CircleMemberStatus.PENDING,
                            CircleMemberStatus.REJECTED, CircleMemberStatus.KICKED)
                );
                if (already) {
                    count++;
                    continue;
                }

                int currentActive = activeCountMap.getOrDefault(circle.getCircleId(), 0);
                CircleMemberStatus status;
                if (currentActive >= circle.getMaxMember()) {
                    // 정원 초과 → 대기
                    status = CircleMemberStatus.PENDING;
                } else if (rng.nextInt(10) < 7) {
                    // 70% ACTIVE
                    status = CircleMemberStatus.ACTIVE;
                    activeCountMap.put(circle.getCircleId(), currentActive + 1);
                } else {
                    status = CircleMemberStatus.PENDING;
                }

                circleMemberRepository.save(CircleMember.builder()
                    .user(member)
                    .circle(circle)
                    .role(CircleRole.MEMBER)
                    .status(status)
                    .build());

                count++;
            }
        }

        // ── 5. 장소 25개 ─────────────────────────────────────────
        // { 이름, 주소, 시, 구, 위도, 경도, 수용인원, 시간당가격, 설명, 오픈시간H, 오픈분, 마감H, 마감분, 최소예약, 최대예약 }
        Object[][] placeData = {
            {"강남 스터디룸 A",     "서울 강남구 테헤란로 152",    "서울", "강남구",  37.5000, 127.0366, 20, 10000, "강남역 2분 거리 조용한 스터디룸. 빔프로젝터·화이트보드 완비.", 9,0,22,0,1,4},
            {"홍대 문화 공간",      "서울 마포구 와우산로 94",      "서울", "마포구",  37.5563, 126.9228, 50, 25000, "홍대 중심부 복합 문화 공간. 공연·전시·파티 모두 가능.", 10,0,23,0,2,6},
            {"이태원 파티룸",       "서울 용산구 이태원로 177",     "서울", "용산구",  37.5346, 126.9940, 30, 30000, "이태원 핫플 파티룸. 사운드 시스템·바 카운터 갖춤.", 12,0,23,59,2,5},
            {"종로 세미나실",       "서울 종로구 종로 51",          "서울", "종로구",  37.5703, 126.9834, 40, 15000, "종각역 바로 앞 깔끔한 세미나실. 기업 교육·동아리 모임 적합.", 8,0,21,0,1,4},
            {"신촌 스포츠센터",     "서울 서대문구 신촌로 83",      "서울", "서대문구",37.5595, 126.9369, 60, 20000, "신촌 실내 스포츠 센터. 배드민턴·탁구·농구 시설 완비.", 7,0,22,0,1,3},
            {"성수 창작 스튜디오",  "서울 성동구 성수이로 78",      "서울", "성동구",  37.5447, 127.0559, 25, 20000, "성수 감성 창작 스튜디오. 사진·영상 촬영 및 워크숍 공간.", 9,0,21,0,1,4},
            {"건대 회의실",         "서울 광진구 능동로 120",       "서울", "광진구",  37.5402, 127.0695, 15, 8000,  "건대입구역 5분 소규모 회의실. 깨끗하고 조용한 환경.", 8,0,22,0,1,3},
            {"한강 노들 야외 무대", "서울 영등포구 노들로 180",     "서울", "영등포구",37.5121, 126.9395, 200,5000,  "한강 노들섬 야외 공연 공간. 피크닉·공연·플리마켓 가능.", 10,0,21,0,2,6},
            {"코엑스 회의실 B",     "서울 강남구 영동대로 513",     "서울", "강남구",  37.5115, 127.0597, 80, 40000, "코엑스 내 프리미엄 회의실. 국제 비즈니스 미팅 수준 시설.", 9,0,20,0,1,4},
            {"잠실 스포츠 센터",    "서울 송파구 올림픽로 25",      "서울", "송파구",  37.5139, 127.1017, 100,18000, "잠실 종합운동장 인근 스포츠 센터. 다목적 홀·헬스장.", 7,0,22,0,1,4},
            {"북촌 한옥 문화관",    "서울 종로구 북촌로 71",        "서울", "종로구",  37.5812, 126.9850, 20, 15000, "북촌 한옥마을 전통 문화 공간. 다도·공예·전통 체험.", 10,0,18,0,1,3},
            {"마포 요리 스튜디오",  "서울 마포구 마포대로 45",      "서울", "마포구",  37.5481, 126.9502, 16, 22000, "마포 전문 요리 스튜디오. 쿠킹 클래스·식품 촬영 가능.", 10,0,21,0,1,3},
            {"상암 미디어 센터",    "서울 마포구 월드컵북로 400",   "서울", "마포구",  37.5701, 126.8913, 50, 30000, "상암 디지털 미디어 시티 내 방송·영상 제작 특화 공간.", 9,0,21,0,2,5},
            {"광화문 컨퍼런스홀",   "서울 종로구 세종대로 175",     "서울", "종로구",  37.5727, 126.9758, 150,35000, "광화문 광장 인근 컨퍼런스 홀. 대형 스크린·동시통역 시설.", 8,0,21,0,2,8},
            {"동대문 풋살장",       "서울 성동구 왕십리로 83",      "서울", "성동구",  37.5666, 127.0082, 22, 12000, "동대문 근처 실내 풋살장. 4팀 동시 사용 가능, 샤워시설 완비.", 7,0,22,0,1,2},
            {"서울숲 피크닉 공간",  "서울 성동구 뚝섬로 273",       "서울", "성동구",  37.5445, 127.0374, 50, 5000,  "서울숲 피크닉 전용 공간. 돗자리·텐트 설치 가능, 그릴 대여.", 9,0,19,0,1,4},
            {"여의도 야외 무대",    "서울 영등포구 여의공원로 68",  "서울", "영등포구",37.5235, 126.9238, 300,8000,  "여의도 한강공원 야외 무대. 버스킹·작은 음악회 최적.", 10,0,21,0,2,5},
            {"합정 공연 홀",        "서울 마포구 양화로 160",       "서울", "마포구",  37.5494, 126.9145, 80, 28000, "합정 메세나폴리스 인근 공연 전용 홀. 음향·조명 전문 시설.", 11,0,23,0,2,6},
            {"망원 바베큐장",       "서울 마포구 망원한강공원로",   "서울", "마포구",  37.5554, 126.9027, 40, 6000,  "망원 한강공원 바베큐 전용 공간. 그릴·테이블 포함, 강변 뷰.", 11,0,21,0,1,3},
            {"신림 볼링센터",       "서울 관악구 신림로 254",       "서울", "관악구",  37.4849, 126.9293, 32, 9000,  "신림 24레인 볼링센터. 그룹 패키지 할인, 음식 반입 가능.", 10,0,23,0,1,3},
            {"석촌호수 카페 홀",    "서울 송파구 올림픽로 240",     "서울", "송파구",  37.5073, 127.1008, 35, 18000, "석촌호수 뷰 카페형 대관 공간. 프리미엄 커피·디저트 포함.", 9,0,21,0,1,3},
            {"인사동 갤러리 홀",    "서울 종로구 인사동길 35",      "서울", "종로구",  37.5726, 126.9862, 30, 20000, "인사동 아트 갤러리 대관. 전시·소규모 행사 전문 공간.", 10,0,20,0,2,5},
            {"수유 클라이밍짐",     "서울 강북구 도봉로 324",       "서울", "강북구",  37.6388, 127.0199, 30, 12000, "북한산 자락 실내 클라이밍 센터. 초급~상급 벽, 강사 상주.", 9,0,22,0,1,3},
            {"용산 복합 문화관",    "서울 용산구 한강대로 366",     "서울", "용산구",  37.5326, 126.9825, 60, 22000, "용산역 인근 복합 문화 공간. 세미나·공연·파티 다목적 홀.", 9,0,22,0,1,5},
            {"강북 야외 캠핑장",    "서울 강북구 오패산로 406",     "서울", "강북구",  37.6297, 127.0214, 40, 10000, "도심 속 야외 캠핑 공간. 텐트 설치·바베큐 가능, 화장실 완비.", 12,0,20,0,2,5},
        };

        Set<String> existingPlaceNames = placeRepository.findAll().stream()
            .map(Place::getName).collect(Collectors.toSet());

        int placeCount = 0;
        for (Object[] p : placeData) {
            if (existingPlaceNames.contains((String) p[0])) continue;
            placeRepository.save(Place.builder()
                .name((String) p[0])
                .address((String) p[1])
                .city((String) p[2])
                .district((String) p[3])
                .latitude((Double) p[4])
                .longitude((Double) p[5])
                .capacity((Integer) p[6])
                .pricePerHour((Integer) p[7])
                .description((String) p[8])
                .openTime(LocalTime.of((Integer) p[9], (Integer) p[10]))
                .closeTime(LocalTime.of((Integer) p[11], (Integer) p[12]))
                .minReservationMinutes((Integer) p[13])
                .maxReservationMinutes((Integer) p[14])
                .build());
            placeCount++;
        }

        // ── 6. 태그 카테고리 + 태그 시드 데이터 ─────────────────

        // 카테고리 정의: {이름, 정렬순서}
        Object[][] categoryData = {
            {"공간 유형", 1},
            {"시설/장비", 2},
            {"분위기", 3},
            {"활동 목적", 4},
            {"모임 규모", 5},
            {"접근성", 6},
            {"주변 환경", 7},
            {"음식/음료", 8},
        };

        Map<String, TagCategory> tagCatMap = tagCategoryRepository.findAll().stream()
            .collect(Collectors.toMap(TagCategory::getName, c -> c));

        for (Object[] c : categoryData) {
            if (!tagCatMap.containsKey((String) c[0])) {
                TagCategory saved = tagCategoryRepository.save(TagCategory.builder()
                    .name((String) c[0])
                    .sortOrder((Integer) c[1])
                    .build());
                tagCatMap.put(saved.getName(), saved);
            }
        }

        // 태그 정의: {카테고리이름, 태그이름}
        String[][] tagData = {
            // ── 공간 유형 (22개)
            {"공간 유형", "카페"},
            {"공간 유형", "스튜디오"},
            {"공간 유형", "세미나실"},
            {"공간 유형", "파티룸"},
            {"공간 유형", "연습실"},
            {"공간 유형", "공유오피스"},
            {"공간 유형", "야외공간"},
            {"공간 유형", "운동시설"},
            {"공간 유형", "한옥"},
            {"공간 유형", "갤러리"},
            {"공간 유형", "공연장"},
            {"공간 유형", "루프탑"},
            {"공간 유형", "공유주방"},
            {"공간 유형", "캠핑장"},
            {"공간 유형", "볼링장"},
            {"공간 유형", "풋살장"},
            {"공간 유형", "클라이밍짐"},
            {"공간 유형", "요가/필라테스"},
            {"공간 유형", "바베큐장"},
            {"공간 유형", "보드게임카페"},
            {"공간 유형", "독립서점"},
            {"공간 유형", "복합문화공간"},

            // ── 시설/장비 (22개)
            {"시설/장비", "빔프로젝터"},
            {"시설/장비", "화이트보드"},
            {"시설/장비", "주차장"},
            {"시설/장비", "음향장비"},
            {"시설/장비", "주방시설"},
            {"시설/장비", "와이파이"},
            {"시설/장비", "에어컨"},
            {"시설/장비", "샤워시설"},
            {"시설/장비", "거울벽"},
            {"시설/장비", "TV/모니터"},
            {"시설/장비", "마이크"},
            {"시설/장비", "조명장비"},
            {"시설/장비", "그릴/바베큐"},
            {"시설/장비", "냉장고"},
            {"시설/장비", "전자레인지"},
            {"시설/장비", "정수기"},
            {"시설/장비", "탈의실"},
            {"시설/장비", "락커"},
            {"시설/장비", "콘센트다수"},
            {"시설/장비", "블루투스스피커"},
            {"시설/장비", "보드게임구비"},
            {"시설/장비", "포토존"},

            // ── 분위기 (16개)
            {"분위기", "모던"},
            {"분위기", "아늑함"},
            {"분위기", "넓은공간"},
            {"분위기", "야외"},
            {"분위기", "조용함"},
            {"분위기", "빈티지"},
            {"분위기", "자연친화"},
            {"분위기", "고급스러움"},
            {"분위기", "캐주얼"},
            {"분위기", "화려함"},
            {"분위기", "심플"},
            {"분위기", "따뜻한조명"},
            {"분위기", "인더스트리얼"},
            {"분위기", "한옥느낌"},
            {"분위기", "감성적"},
            {"분위기", "깔끔함"},

            // ── 활동 목적 (28개)
            {"활동 목적", "회의"},
            {"활동 목적", "촬영"},
            {"활동 목적", "파티"},
            {"활동 목적", "스터디"},
            {"활동 목적", "공연"},
            {"활동 목적", "워크숍"},
            {"활동 목적", "운동"},
            {"활동 목적", "요리"},
            {"활동 목적", "보드게임"},
            {"활동 목적", "독서모임"},
            {"활동 목적", "생일파티"},
            {"활동 목적", "동창회"},
            {"활동 목적", "팀빌딩"},
            {"활동 목적", "세미나"},
            {"활동 목적", "강연"},
            {"활동 목적", "전시"},
            {"활동 목적", "플리마켓"},
            {"활동 목적", "버스킹"},
            {"활동 목적", "댄스"},
            {"활동 목적", "요가/명상"},
            {"활동 목적", "영화감상"},
            {"활동 목적", "음악연습"},
            {"활동 목적", "수공예"},
            {"활동 목적", "그림/드로잉"},
            {"활동 목적", "피크닉"},
            {"활동 목적", "네트워킹"},
            {"활동 목적", "번개모임"},
            {"활동 목적", "정기모임"},

            // ── 모임 규모 (5개)
            {"모임 규모", "소규모(~10명)"},
            {"모임 규모", "중규모(11~30명)"},
            {"모임 규모", "대규모(31~50명)"},
            {"모임 규모", "대형(51~100명)"},
            {"모임 규모", "초대형(100명+)"},

            // ── 접근성 (6개)
            {"접근성", "역세권"},
            {"접근성", "주차편리"},
            {"접근성", "대중교통편리"},
            {"접근성", "엘리베이터"},
            {"접근성", "장애인편의시설"},
            {"접근성", "1층위치"},

            // ── 주변 환경 (9개)
            {"주변 환경", "한강뷰"},
            {"주변 환경", "산뷰"},
            {"주변 환경", "도심뷰"},
            {"주변 환경", "공원인접"},
            {"주변 환경", "맛집밀집"},
            {"주변 환경", "카페거리"},
            {"주변 환경", "쇼핑가인접"},
            {"주변 환경", "자연속"},
            {"주변 환경", "조용한주택가"},

            // ── 음식/음료 (7개)
            {"음식/음료", "음식반입가능"},
            {"음식/음료", "음주가능"},
            {"음식/음료", "케이터링가능"},
            {"음식/음료", "커피머신"},
            {"음식/음료", "취사가능"},
            {"음식/음료", "배달수령가능"},
            {"음식/음료", "음료제공"},
        };

        Set<String> existingTagNames = tagRepository.findAll().stream()
            .map(Tag::getName).collect(Collectors.toSet());

        int tagCount = 0;
        for (String[] t : tagData) {
            if (existingTagNames.contains(t[1])) continue;
            TagCategory category = tagCatMap.get(t[0]);
            if (category == null) continue;
            tagRepository.save(Tag.builder()
                .name(t[1])
                .tagCategory(category)
                .build());
            tagCount++;
        }

        // ── 7. currentMember 및 FULL 상태 동기화 ─────────────────
        circleRepository.syncAllCurrentMembers();
        circleRepository.syncFullStatus();

        System.out.println("✅ 테스트 데이터 생성 완료!");
        System.out.println("   - 카테고리: " + catMap.size() + "개");
        System.out.println("   - 유저: " + userList.size() + "명 (비밀번호: 1234)");
        System.out.println("   - 서클: " + circleList.size() + "개");
        System.out.println("   - 장소: " + placeCount + "개 추가됨");
        System.out.println("   - 태그 카테고리: " + tagCatMap.size() + "개");
        System.out.println("   - 태그: " + tagCount + "개 추가됨");
    }
}
