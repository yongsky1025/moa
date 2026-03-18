package com.soldesk.moa.schedule.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QScheduleTag is a Querydsl query type for ScheduleTag
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QScheduleTag extends EntityPathBase<ScheduleTag> {

    private static final long serialVersionUID = -1324948242L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QScheduleTag scheduleTag = new QScheduleTag("scheduleTag");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QSchedule schedule;

    public final com.soldesk.moa.place.entity.QTag tag;

    public QScheduleTag(String variable) {
        this(ScheduleTag.class, forVariable(variable), INITS);
    }

    public QScheduleTag(Path<? extends ScheduleTag> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QScheduleTag(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QScheduleTag(PathMetadata metadata, PathInits inits) {
        this(ScheduleTag.class, metadata, inits);
    }

    public QScheduleTag(Class<? extends ScheduleTag> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.schedule = inits.isInitialized("schedule") ? new QSchedule(forProperty("schedule"), inits.get("schedule")) : null;
        this.tag = inits.isInitialized("tag") ? new com.soldesk.moa.place.entity.QTag(forProperty("tag")) : null;
    }

}

