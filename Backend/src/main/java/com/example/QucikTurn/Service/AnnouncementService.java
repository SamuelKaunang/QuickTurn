package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Announcement;
import com.example.QucikTurn.Repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository repo;

    public AnnouncementService(AnnouncementRepository repo) {
        this.repo = repo;
    }

    public Announcement createAnnouncement(String title, String content) {
        Announcement announcement = Announcement.builder()
                .title(title)
                .content(content)
                .build();
        return repo.save(announcement);
    }

    public List<Announcement> getAllAnnouncements() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public void deleteAnnouncement(Long id) {
        repo.deleteById(id);
    }
}
