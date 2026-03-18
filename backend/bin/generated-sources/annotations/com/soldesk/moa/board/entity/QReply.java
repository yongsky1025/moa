package com.soldesk.moa.board.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QReply is a Querydsl query type for Reply
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QReply extends EntityPathBase<Reply> {

    private static final long serialVersionUID = 400364488L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QReply reply = new QReply("reply");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final StringPath content = createString("content");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final BooleanPath deleted = createBoolean("deleted");

    public final NumberPath<Integer> depth = createNumber("depth", Integer.class);

    public final QReply parentId;

    public final QPost postId;

    public final NumberPath<Long> replyId = createNumber("replyId", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public final com.soldesk.moa.users.entity.QUsers userId;

    public QReply(String variable) {
        this(Reply.class, forVariable(variable), INITS);
    }

    public QReply(Path<? extends Reply> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QReply(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QReply(PathMetadata metadata, PathInits inits) {
        this(Reply.class, metadata, inits);
    }

    public QReply(Class<? extends Reply> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.parentId = inits.isInitialized("parentId") ? new QReply(forProperty("parentId"), inits.get("parentId")) : null;
        this.postId = inits.isInitialized("postId") ? new QPost(forProperty("postId"), inits.get("postId")) : null;
        this.userId = inits.isInitialized("userId") ? new com.soldesk.moa.users.entity.QUsers(forProperty("userId"), inits.get("userId")) : null;
    }

}

