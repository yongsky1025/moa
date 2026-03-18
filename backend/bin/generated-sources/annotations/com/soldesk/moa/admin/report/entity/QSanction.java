package com.soldesk.moa.admin.report.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSanction is a Querydsl query type for Sanction
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSanction extends EntityPathBase<Sanction> {

    private static final long serialVersionUID = 996949032L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSanction sanction = new QSanction("sanction");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final com.soldesk.moa.users.entity.QUsers admin;

    public final DateTimePath<java.time.LocalDateTime> cancelledAt = createDateTime("cancelledAt", java.time.LocalDateTime.class);

    public final com.soldesk.moa.users.entity.QUsers cancelledBy;

    public final StringPath cancelReason = createString("cancelReason");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final DateTimePath<java.time.LocalDateTime> endAt = createDateTime("endAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath reason = createString("reason");

    public final QReport report;

    public final EnumPath<com.soldesk.moa.admin.report.entity.constant.SanctionState> sanctionState = createEnum("sanctionState", com.soldesk.moa.admin.report.entity.constant.SanctionState.class);

    public final EnumPath<com.soldesk.moa.admin.report.entity.constant.SanctionType> sanctionType = createEnum("sanctionType", com.soldesk.moa.admin.report.entity.constant.SanctionType.class);

    public final DateTimePath<java.time.LocalDateTime> startAt = createDateTime("startAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> targetId = createNumber("targetId", Long.class);

    public final EnumPath<com.soldesk.moa.admin.report.entity.constant.ReportTargetType> targetType = createEnum("targetType", com.soldesk.moa.admin.report.entity.constant.ReportTargetType.class);

    public final com.soldesk.moa.users.entity.QUsers targetUser;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public QSanction(String variable) {
        this(Sanction.class, forVariable(variable), INITS);
    }

    public QSanction(Path<? extends Sanction> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSanction(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSanction(PathMetadata metadata, PathInits inits) {
        this(Sanction.class, metadata, inits);
    }

    public QSanction(Class<? extends Sanction> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.admin = inits.isInitialized("admin") ? new com.soldesk.moa.users.entity.QUsers(forProperty("admin"), inits.get("admin")) : null;
        this.cancelledBy = inits.isInitialized("cancelledBy") ? new com.soldesk.moa.users.entity.QUsers(forProperty("cancelledBy"), inits.get("cancelledBy")) : null;
        this.report = inits.isInitialized("report") ? new QReport(forProperty("report"), inits.get("report")) : null;
        this.targetUser = inits.isInitialized("targetUser") ? new com.soldesk.moa.users.entity.QUsers(forProperty("targetUser"), inits.get("targetUser")) : null;
    }

}

