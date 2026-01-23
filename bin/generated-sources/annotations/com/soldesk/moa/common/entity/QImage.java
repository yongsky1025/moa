package com.soldesk.moa.common.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QImage is a Querydsl query type for Image
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QImage extends EntityPathBase<Image> {

    private static final long serialVersionUID = -1107989006L;

    public static final QImage image = new QImage("image");

    public final NumberPath<Long> imageId = createNumber("imageId", Long.class);

    public final StringPath name = createString("name");

    public final NumberPath<Long> ord = createNumber("ord", Long.class);

    public final StringPath path = createString("path");

    public final StringPath uuid = createString("uuid");

    public QImage(String variable) {
        super(Image.class, forVariable(variable));
    }

    public QImage(Path<? extends Image> path) {
        super(path.getType(), path.getMetadata());
    }

    public QImage(PathMetadata metadata) {
        super(Image.class, metadata);
    }

}

