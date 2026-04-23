package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    Optional<Topic> findBySubjectIdAndLevel(Integer subjectId, Integer level);
}