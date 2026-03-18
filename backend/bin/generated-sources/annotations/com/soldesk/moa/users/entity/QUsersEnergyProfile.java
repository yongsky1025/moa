package com.soldesk.moa.users.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUsersEnergyProfile is a Querydsl query type for UsersEnergyProfile
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUsersEnergyProfile extends EntityPathBase<UsersEnergyProfile> {

    private static final long serialVersionUID = -646437539L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUsersEnergyProfile usersEnergyProfile = new QUsersEnergyProfile("usersEnergyProfile");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final NumberPath<Integer> activityIntensity = createNumber("activityIntensity", Integer.class);

    public final NumberPath<Integer> commitmentLevel = createNumber("commitmentLevel", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final NumberPath<Integer> interactionMode = createNumber("interactionMode", Integer.class);

    public final NumberPath<Long> profileId = createNumber("profileId", Long.class);

    public final NumberPath<Integer> socialLoad = createNumber("socialLoad", Integer.class);

    public final NumberPath<Integer> structureLevel = createNumber("structureLevel", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public final QUsers user;

    public QUsersEnergyProfile(String variable) {
        this(UsersEnergyProfile.class, forVariable(variable), INITS);
    }

    public QUsersEnergyProfile(Path<? extends UsersEnergyProfile> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUsersEnergyProfile(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUsersEnergyProfile(PathMetadata metadata, PathInits inits) {
        this(UsersEnergyProfile.class, metadata, inits);
    }

    public QUsersEnergyProfile(Class<? extends UsersEnergyProfile> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user"), inits.get("user")) : null;
    }

}

