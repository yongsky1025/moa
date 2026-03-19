package com.soldesk.moa;

import com.soldesk.moa.circle.entity.*;
import com.soldesk.moa.circle.entity.constant.*;
import com.soldesk.moa.circle.repository.*;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.repository.PlaceRepository;
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
                .minReservationHour((Integer) p[13])
                .maxReservationHour((Integer) p[14])
                .build());
            placeCount++;
        }

        // ── 6. currentMember 및 FULL 상태 동기화 ─────────────────
        circleRepository.syncAllCurrentMembers();
        circleRepository.syncFullStatus();

        System.out.println("✅ 테스트 데이터 생성 완료!");
        System.out.println("   - 카테고리: " + catMap.size() + "개");
        System.out.println("   - 유저: " + userList.size() + "명 (비밀번호: 1234)");
        System.out.println("   - 서클: " + circleList.size() + "개");
        System.out.println("   - 장소: " + placeCount + "개 추가됨");
    }
}
