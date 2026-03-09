package com.soldesk.moa.place.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPlace is a Querydsl query type for Place
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPlace extends EntityPathBase<Place> {

    private static final long serialVersionUID = -2084360860L;

    public static final QPlace place = new QPlace("place");

    public final StringPath address = createString("address");

    public final NumberPath<Integer> capacity = createNumber("capacity", Integer.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Double> latitude = createNumber("latitude", Double.class);

    public final NumberPath<Double> longitude = createNumber("longitude", Double.class);

    public final StringPath name = createString("name");

    public final NumberPath<Integer> pricePerHour = createNumber("pricePerHour", Integer.class);

    public final ListPath<Reservation, QReservation> reservations = this.<Reservation, QReservation>createList("reservations", Reservation.class, QReservation.class, PathInits.DIRECT2);

    public final ListPath<PlaceReview, QPlaceReview> reviews = this.<PlaceReview, QPlaceReview>createList("reviews", PlaceReview.class, QPlaceReview.class, PathInits.DIRECT2);

    public final ListPath<PlaceTag, QPlaceTag> tags = this.<PlaceTag, QPlaceTag>createList("tags", PlaceTag.class, QPlaceTag.class, PathInits.DIRECT2);

    public QPlace(String variable) {
        super(Place.class, forVariable(variable));
    }

    public QPlace(Path<? extends Place> path) {
        super(path.getType(), path.getMetadata());
    }

    public QPlace(PathMetadata metadata) {
        super(Place.class, metadata);
    }

}

