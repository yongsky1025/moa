package com.soldesk.moa.circle.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCircleMember is a Querydsl query type for CircleMember
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCircleMember extends EntityPathBase<CircleMember> {

    private static final long serialVersionUID = 882751864L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCircleMember circleMember = new QCircleMember("circleMember");

    public final QCircle circle;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final EnumPath<com.soldesk.moa.circle.entity.constant.CircleRole> role = createEnum("role", com.soldesk.moa.circle.entity.constant.CircleRole.class);

    public final EnumPath<com.soldesk.moa.circle.entity.constant.CircleMemberStatus> status = createEnum("status", com.soldesk.moa.circle.entity.constant.CircleMemberStatus.class);

    public final com.soldesk.moa.users.entity.QUsers user;

    public QCircleMember(String variable) {
        this(CircleMember.class, forVariable(variable), INITS);
    }

    public QCircleMember(Path<? extends CircleMember> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCircleMember(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCircleMember(PathMetadata metadata, PathInits inits) {
        this(CircleMember.class, metadata, inits);
    }

    public QCircleMember(Class<? extends CircleMember> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.circle = inits.isInitialized("circle") ? new QCircle(forProperty("circle"), inits.get("circle")) : null;
        this.user = inits.isInitialized("user") ? new com.soldesk.moa.users.entity.QUsers(forProperty("user")) : null;
    }

}

