package com.soldesk.moa.users.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUsers is a Querydsl query type for Users
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUsers extends EntityPathBase<Users> {

    private static final long serialVersionUID = -1278273788L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUsers users = new QUsers("users");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final NumberPath<Integer> age = createNumber("age", Integer.class);

    public final DatePath<java.time.LocalDate> birthDate = createDate("birthDate", java.time.LocalDate.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final StringPath email = createString("email");

    public final QUsersEnergyProfile energyProfile;

    public final ListPath<com.soldesk.moa.common.entity.Image, com.soldesk.moa.common.entity.QImage> images = this.<com.soldesk.moa.common.entity.Image, com.soldesk.moa.common.entity.QImage>createList("images", com.soldesk.moa.common.entity.Image.class, com.soldesk.moa.common.entity.QImage.class, PathInits.DIRECT2);

    public final StringPath name = createString("name");

    public final StringPath nickname = createString("nickname");

    public final DateTimePath<java.time.LocalDateTime> onboardingCompletedAt = createDateTime("onboardingCompletedAt", java.time.LocalDateTime.class);

    public final StringPath password = createString("password");

    public final ListPath<com.soldesk.moa.board.entity.Post, com.soldesk.moa.board.entity.QPost> posts = this.<com.soldesk.moa.board.entity.Post, com.soldesk.moa.board.entity.QPost>createList("posts", com.soldesk.moa.board.entity.Post.class, com.soldesk.moa.board.entity.QPost.class, PathInits.DIRECT2);

    public final DateTimePath<java.time.LocalDateTime> privacyAgreedAt = createDateTime("privacyAgreedAt", java.time.LocalDateTime.class);

    public final EnumPath<com.soldesk.moa.users.entity.constant.AuthProvider> provider = createEnum("provider", com.soldesk.moa.users.entity.constant.AuthProvider.class);

    public final StringPath providerId = createString("providerId");

    public final StringPath publicId = createString("publicId");

    public final ListPath<com.soldesk.moa.board.entity.Reply, com.soldesk.moa.board.entity.QReply> replies = this.<com.soldesk.moa.board.entity.Reply, com.soldesk.moa.board.entity.QReply>createList("replies", com.soldesk.moa.board.entity.Reply.class, com.soldesk.moa.board.entity.QReply.class, PathInits.DIRECT2);

    public final NumberPath<Integer> sanctionCount = createNumber("sanctionCount", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public final EnumPath<com.soldesk.moa.users.entity.constant.UserGender> userGender = createEnum("userGender", com.soldesk.moa.users.entity.constant.UserGender.class);

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public final EnumPath<com.soldesk.moa.users.entity.constant.UserRole> userRole = createEnum("userRole", com.soldesk.moa.users.entity.constant.UserRole.class);

    public final EnumPath<com.soldesk.moa.users.entity.constant.UserStatus> userStatus = createEnum("userStatus", com.soldesk.moa.users.entity.constant.UserStatus.class);

    public final DateTimePath<java.time.LocalDateTime> withdrawnAt = createDateTime("withdrawnAt", java.time.LocalDateTime.class);

    public QUsers(String variable) {
        this(Users.class, forVariable(variable), INITS);
    }

    public QUsers(Path<? extends Users> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUsers(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUsers(PathMetadata metadata, PathInits inits) {
        this(Users.class, metadata, inits);
    }

    public QUsers(Class<? extends Users> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.energyProfile = inits.isInitialized("energyProfile") ? new QUsersEnergyProfile(forProperty("energyProfile"), inits.get("energyProfile")) : null;
    }

}

