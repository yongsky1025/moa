package com.soldesk.moa.schedule.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QScheduleMember is a Querydsl query type for ScheduleMember
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QScheduleMember extends EntityPathBase<ScheduleMember> {

    private static final long serialVersionUID = -980060986L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QScheduleMember scheduleMember = new QScheduleMember("scheduleMember");

    public final com.soldesk.moa.circle.entity.QCircleMember circleMember;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QSchedule schedule;

    public final EnumPath<com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus> status = createEnum("status", com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus.class);

    public QScheduleMember(String variable) {
        this(ScheduleMember.class, forVariable(variable), INITS);
    }

    public QScheduleMember(Path<? extends ScheduleMember> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QScheduleMember(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QScheduleMember(PathMetadata metadata, PathInits inits) {
        this(ScheduleMember.class, metadata, inits);
    }

    public QScheduleMember(Class<? extends ScheduleMember> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.circleMember = inits.isInitialized("circleMember") ? new com.soldesk.moa.circle.entity.QCircleMember(forProperty("circleMember"), inits.get("circleMember")) : null;
        this.schedule = inits.isInitialized("schedule") ? new QSchedule(forProperty("schedule"), inits.get("schedule")) : null;
    }

}

