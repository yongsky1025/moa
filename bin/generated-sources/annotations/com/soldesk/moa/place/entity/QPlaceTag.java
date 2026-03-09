package com.soldesk.moa.place.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPlaceTag is a Querydsl query type for PlaceTag
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPlaceTag extends EntityPathBase<PlaceTag> {

    private static final long serialVersionUID = 1442869142L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPlaceTag placeTag = new QPlaceTag("placeTag");

    public final QPlace place;

    public final QTag tag;

    public QPlaceTag(String variable) {
        this(PlaceTag.class, forVariable(variable), INITS);
    }

    public QPlaceTag(Path<? extends PlaceTag> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPlaceTag(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPlaceTag(PathMetadata metadata, PathInits inits) {
        this(PlaceTag.class, metadata, inits);
    }

    public QPlaceTag(Class<? extends PlaceTag> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.place = inits.isInitialized("place") ? new QPlace(forProperty("place")) : null;
        this.tag = inits.isInitialized("tag") ? new QTag(forProperty("tag")) : null;
    }

}

