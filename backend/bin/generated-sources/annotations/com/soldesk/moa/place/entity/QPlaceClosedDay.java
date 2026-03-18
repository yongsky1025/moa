package com.soldesk.moa.place.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPlaceClosedDay is a Querydsl query type for PlaceClosedDay
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPlaceClosedDay extends EntityPathBase<PlaceClosedDay> {

    private static final long serialVersionUID = -1209637492L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPlaceClosedDay placeClosedDay = new QPlaceClosedDay("placeClosedDay");

    public final EnumPath<com.soldesk.moa.place.entity.constant.ClosedType> closedType = createEnum("closedType", com.soldesk.moa.place.entity.constant.ClosedType.class);

    public final DatePath<java.time.LocalDate> date = createDate("date", java.time.LocalDate.class);

    public final EnumPath<java.time.DayOfWeek> dayOfWeek = createEnum("dayOfWeek", java.time.DayOfWeek.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QPlace place;

    public final StringPath reason = createString("reason");

    public QPlaceClosedDay(String variable) {
        this(PlaceClosedDay.class, forVariable(variable), INITS);
    }

    public QPlaceClosedDay(Path<? extends PlaceClosedDay> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPlaceClosedDay(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPlaceClosedDay(PathMetadata metadata, PathInits inits) {
        this(PlaceClosedDay.class, metadata, inits);
    }

    public QPlaceClosedDay(Class<? extends PlaceClosedDay> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.place = inits.isInitialized("place") ? new QPlace(forProperty("place")) : null;
    }

}

