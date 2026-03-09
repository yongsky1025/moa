package com.soldesk.moa.circle.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCircle is a Querydsl query type for Circle
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCircle extends EntityPathBase<Circle> {

    private static final long serialVersionUID = 118925630L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCircle circle = new QCircle("circle");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final QCircleCategory category;

    public final NumberPath<Long> circleId = createNumber("circleId", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final NumberPath<Integer> currentMember = createNumber("currentMember", Integer.class);

    public final StringPath description = createString("description");

    public final NumberPath<Integer> maxMember = createNumber("maxMember", Integer.class);

    public final StringPath name = createString("name");

    public final EnumPath<com.soldesk.moa.circle.entity.constant.CircleStatus> status = createEnum("status", com.soldesk.moa.circle.entity.constant.CircleStatus.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public QCircle(String variable) {
        this(Circle.class, forVariable(variable), INITS);
    }

    public QCircle(Path<? extends Circle> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCircle(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCircle(PathMetadata metadata, PathInits inits) {
        this(Circle.class, metadata, inits);
    }

    public QCircle(Class<? extends Circle> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.category = inits.isInitialized("category") ? new QCircleCategory(forProperty("category")) : null;
    }

}

