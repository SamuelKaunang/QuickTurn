package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // We can add custom queries if needed, for example finding latest ones
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
