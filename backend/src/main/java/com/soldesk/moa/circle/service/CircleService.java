package com.soldesk.moa.circle.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

<<<<<<< HEAD
=======
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58
import com.soldesk.moa.circle.dto.CircleCreateRequestDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.dto.CircleUpdateRequestDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleMember;
<<<<<<< HEAD
=======
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
<<<<<<< HEAD
=======
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CircleService {

        private final CircleRepository circleRepository;
        private final CircleCategoryRepository categoryRepository;
        private final CircleMemberRepository circleMemberRepository;
<<<<<<< HEAD

        // 서클 생성
        @Transactional
        public CircleResponseDTO createCircle(CircleCreateRequestDTO request) {
=======
        private final UsersRepository usersRepository;
        private final BoardRepository boardRepository;

        // 서클 생성
        @Transactional
        public CircleResponseDTO createCircle(CircleCreateRequestDTO request, Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58

                CircleCategory circleCategory = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

                Circle circle = Circle.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .maxMember(request.getMaxMember())
                                .currentMember(1) // 최초 멤버 = 생성자
                                .status(CircleStatus.OPEN) // 기본 OPEN
                                .category(circleCategory)
                                .build();

                Circle savedCircle = circleRepository.save(circle);

                // 3. CircleMember 생성 (모임장)
                CircleMember leader = CircleMember.builder()
                                .circle(savedCircle)
<<<<<<< HEAD
                                .role(CircleRole.LEADER)
=======
                                .user(loginUser)
                                .role(CircleRole.LEADER)
                                .status(CircleMemberStatus.ACTIVE)
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58
                                .build();

                circleMemberRepository.save(leader);

<<<<<<< HEAD
                return new CircleResponseDTO(savedCircle);
        }

        @Transactional(readOnly = true)
        public List<CircleResponseDTO> getCircles() {
                return circleRepository.findAll()
                                .stream()
                                .map(CircleResponseDTO::new)
                                .toList();
=======
                // 기본 게시판 3개 생성
                List<Board> defaultBoards = List.of(
                                Board.builder().boardType(BoardType.CIRCLE).name("공지사항").circleId(savedCircle).build(),
                                Board.builder().boardType(BoardType.CIRCLE).name("가입인사").circleId(savedCircle).build(),
                                Board.builder().boardType(BoardType.CIRCLE).name("후기 및 인증").circleId(savedCircle)
                                                .build());
                boardRepository.saveAll(defaultBoards);

                return new CircleResponseDTO(savedCircle);
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58
        }

        @Transactional
        public void deleteCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                circleRepository.delete(circle);
        }

        @Transactional
        public CircleResponseDTO updateCircle(Long circleId, CircleUpdateRequestDTO request) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Circle updatedCircle = Circle.builder()
                                .circleId(circle.getCircleId())
                                .name(request.getName())
                                .description(request.getDescription())
                                .maxMember(circle.getMaxMember())
                                .currentMember(circle.getCurrentMember())
                                .status(circle.getStatus())
                                .category(circle.getCategory())
                                .build();

                return new CircleResponseDTO(circleRepository.save(updatedCircle));
        }

        @Transactional(readOnly = true)
<<<<<<< HEAD
        public List<CircleResponseDTO> getCirclesByCategory(Long categoryId) {

                return circleRepository.findByCategory_CategoryId(categoryId)
                                .stream()
                                .map(CircleResponseDTO::new)
                                .toList();
        }
=======
        public PageResultDTO<CircleResponseDTO> getCircles(
                        Long categoryId,
                        PageRequestDTO pageRequestDTO) {

                PageResultDTO<Circle> result = circleRepository.findByCategory_CategoryId(
                                categoryId,
                                pageRequestDTO);

                // 엔티티 → DTO 변환
                return PageResultDTO.<CircleResponseDTO>withAll()
                                .dtoList(
                                                result.getDtoList()
                                                                .stream()
                                                                .map(CircleResponseDTO::new)
                                                                .toList())
                                .pageRequestDTO(pageRequestDTO)
                                .totalCount(result.getTotalCount())
                                .build();
        }

>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58
}