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

    public static final QUsers users = new QUsers("users");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final StringPath address = createString("address");

    public final NumberPath<Integer> age = createNumber("age", Integer.class);

    public final DatePath<java.time.LocalDate> birthDate = createDate("birthDate", java.time.LocalDate.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final StringPath email = createString("email");

    public final ListPath<com.soldesk.moa.common.entity.Image, com.soldesk.moa.common.entity.QImage> images = this.<com.soldesk.moa.common.entity.Image, com.soldesk.moa.common.entity.QImage>createList("images", com.soldesk.moa.common.entity.Image.class, com.soldesk.moa.common.entity.QImage.class, PathInits.DIRECT2);

    public final StringPath name = createString("name");

    public final StringPath nickname = createString("nickname");

    public final StringPath password = createString("password");

    public final StringPath phone = createString("phone");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public final EnumPath<com.soldesk.moa.users.entity.constant.UserGender> userGender = createEnum("userGender", com.soldesk.moa.users.entity.constant.UserGender.class);

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public final EnumPath<com.soldesk.moa.users.entity.constant.UserRole> userRole = createEnum("userRole", com.soldesk.moa.users.entity.constant.UserRole.class);

    public final EnumPath<com.soldesk.moa.users.entity.constant.UserStatus> userStatus = createEnum("userStatus", com.soldesk.moa.users.entity.constant.UserStatus.class);

    public QUsers(String variable) {
        super(Users.class, forVariable(variable));
    }

    public QUsers(Path<? extends Users> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUsers(PathMetadata metadata) {
        super(Users.class, metadata);
    }

}

