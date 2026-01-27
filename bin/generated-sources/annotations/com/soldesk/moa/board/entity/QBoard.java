package com.soldesk.moa.board.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QBoard is a Querydsl query type for Board
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QBoard extends EntityPathBase<Board> {

    private static final long serialVersionUID = 385871812L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QBoard board = new QBoard("board");

    public final com.soldesk.moa.common.entity.QBaseEntity _super = new com.soldesk.moa.common.entity.QBaseEntity(this);

    public final QBoardCategory boardCategory;

    public final NumberPath<Long> boardId = createNumber("boardId", Long.class);

    public final com.soldesk.moa.circle.entity.QCircle circle;

    public final StringPath content = createString("content");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createDate = _super.createDate;

    public final ListPath<Reply, QReply> replies = this.<Reply, QReply>createList("replies", Reply.class, QReply.class, PathInits.DIRECT2);

    public final StringPath title = createString("title");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updateDate = _super.updateDate;

    public final com.soldesk.moa.users.entity.QUsers user;

    public QBoard(String variable) {
        this(Board.class, forVariable(variable), INITS);
    }

    public QBoard(Path<? extends Board> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QBoard(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QBoard(PathMetadata metadata, PathInits inits) {
        this(Board.class, metadata, inits);
    }

    public QBoard(Class<? extends Board> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.boardCategory = inits.isInitialized("boardCategory") ? new QBoardCategory(forProperty("boardCategory")) : null;
        this.circle = inits.isInitialized("circle") ? new com.soldesk.moa.circle.entity.QCircle(forProperty("circle"), inits.get("circle")) : null;
        this.user = inits.isInitialized("user") ? new com.soldesk.moa.users.entity.QUsers(forProperty("user")) : null;
    }

}

