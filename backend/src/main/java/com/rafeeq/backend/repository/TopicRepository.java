package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {
    List<Topic> findBySubjectIdOrderByOrderNumAsc(Integer subjectId);
    List<Topic> findByLevelOrderByOrderNumAsc(Integer level);
    Optional<Topic> findFirstByLevelOrderByOrderNumAsc(Integer level);
}
