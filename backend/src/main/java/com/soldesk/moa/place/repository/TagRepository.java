package com.soldesk.moa.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.place.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {

}
