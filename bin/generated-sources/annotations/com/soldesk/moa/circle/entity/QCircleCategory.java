package com.soldesk.moa.circle.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCircleCategory is a Querydsl query type for CircleCategory
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCircleCategory extends EntityPathBase<CircleCategory> {

    private static final long serialVersionUID = -1379029924L;

    public static final QCircleCategory circleCategory = new QCircleCategory("circleCategory");

    public final NumberPath<Long> categoryId = createNumber("categoryId", Long.class);

    public final StringPath categoryName = createString("categoryName");

    public final ListPath<Circle, QCircle> circles = this.<Circle, QCircle>createList("circles", Circle.class, QCircle.class, PathInits.DIRECT2);

    public QCircleCategory(String variable) {
        super(CircleCategory.class, forVariable(variable));
    }

    public QCircleCategory(Path<? extends CircleCategory> path) {
        super(path.getType(), path.getMetadata());
    }

    public QCircleCategory(PathMetadata metadata) {
        super(CircleCategory.class, metadata);
    }

}

