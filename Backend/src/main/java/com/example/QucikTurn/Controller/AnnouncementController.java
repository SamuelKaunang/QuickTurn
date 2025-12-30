package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.Announcement;
import com.example.QucikTurn.Service.AnnouncementService;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Announcement>>> getAllAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok("Announcements", announcementService.getAllAnnouncements()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String content = payload.get("content");
        
        if (title == null || content == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Title and content are required"));
        }

        Announcement created = announcementService.createAnnouncement(title, content);
        return ResponseEntity.ok(ApiResponse.ok("Announcement created", created));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Announcement deleted", null));
    }
}
