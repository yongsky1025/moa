package com.soldesk.moa.place.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPlaceReview is a Querydsl query type for PlaceReview
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPlaceReview extends EntityPathBase<PlaceReview> {

    private static final long serialVersionUID = 428897756L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPlaceReview placeReview = new QPlaceReview("placeReview");

    public final StringPath comment = createString("comment");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QPlace place;

    public final NumberPath<Integer> rating = createNumber("rating", Integer.class);

    public final com.soldesk.moa.users.entity.QUsers reviewer;

    public QPlaceReview(String variable) {
        this(PlaceReview.class, forVariable(variable), INITS);
    }

    public QPlaceReview(Path<? extends PlaceReview> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPlaceReview(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPlaceReview(PathMetadata metadata, PathInits inits) {
        this(PlaceReview.class, metadata, inits);
    }

    public QPlaceReview(Class<? extends PlaceReview> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.place = inits.isInitialized("place") ? new QPlace(forProperty("place")) : null;
        this.reviewer = inits.isInitialized("reviewer") ? new com.soldesk.moa.users.entity.QUsers(forProperty("reviewer")) : null;
    }

}

