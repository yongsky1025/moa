package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.schedule.entity.QSchedule;
import com.soldesk.moa.schedule.entity.Schedule;

public class SearchScheduleRepositoryImpl extends QuerydslRepositorySupport implements SearchScheduleRepository {

    public SearchScheduleRepositoryImpl() {
        super(Schedule.class);
    }

    @Override
    public List<Object[]> findScheduleStartActivity(LocalDateTime since) {
        QSchedule schedule = QSchedule.schedule;

        NumberExpression<Integer> hour = Expressions.numberTemplate(Integer.class, "hour({0})",
                schedule.startAt);

        NumberExpression<Integer> day = Expressions.numberTemplate(Integer.class, "dayofweek({0})",
                schedule.startAt);

        JPQLQuery<Schedule> query = from(schedule).where(schedule.startAt.goe(since));

        JPQLQuery<Tuple> tuple = query.select(day, hour, schedule.count());

        tuple.groupBy(day, hour);
        List<Tuple> list = tuple.fetch();

        return list.stream().map(Tuple::toArray).collect(Collectors.toList());

    }

}
