package com.soldesk.moa.admin.log.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QAdminActionLog is a Querydsl query type for AdminActionLog
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QAdminActionLog extends EntityPathBase<AdminActionLog> {

    private static final long serialVersionUID = 1599997952L;

    public static final QAdminActionLog adminActionLog = new QAdminActionLog("adminActionLog");

    public final EnumPath<com.soldesk.moa.admin.log.entity.constant.ActionType> actionType = createEnum("actionType", com.soldesk.moa.admin.log.entity.constant.ActionType.class);

    public final NumberPath<Long> actorId = createNumber("actorId", Long.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath ipAddress = createString("ipAddress");

    public final StringPath methodName = createString("methodName");

    public final StringPath requestUrl = createString("requestUrl");

    public final NumberPath<Long> targetId = createNumber("targetId", Long.class);

    public final StringPath targetType = createString("targetType");

    public final DateTimePath<java.time.LocalDateTime> timestamp = createDateTime("timestamp", java.time.LocalDateTime.class);

    public final StringPath userAgent = createString("userAgent");

    public QAdminActionLog(String variable) {
        super(AdminActionLog.class, forVariable(variable));
    }

    public QAdminActionLog(Path<? extends AdminActionLog> path) {
        super(path.getType(), path.getMetadata());
    }

    public QAdminActionLog(PathMetadata metadata) {
        super(AdminActionLog.class, metadata);
    }

}

