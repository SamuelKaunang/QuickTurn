package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.WorkSubmissionRepository;
import com.example.QucikTurn.dto.NearbyProjectResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link ProjectViewerService#getNearbyProjects} covering
 * filtering by radius, sorting by nearest distance, excluding projects without
 * coordinates, and query parameter validation.
 *
 * <p>
 * Uses plain Mockito (no Spring context) so it runs without a database.
 * </p>
 */
class ProjectViewerServiceNearbyTest {

    private ProjectRepository projectRepo;
    private ProjectViewerService service;

    // Reference location: Bandung city center
    private static final double USER_LAT = -6.9000;
    private static final double USER_LNG = 107.6000;

    @BeforeEach
    void setUp() {
        projectRepo = mock(ProjectRepository.class);
        ApplicationRepository applicationRepo = mock(ApplicationRepository.class);
        WorkSubmissionRepository workSubmissionRepo = mock(WorkSubmissionRepository.class);
        service = new ProjectViewerService(projectRepo, applicationRepo, workSubmissionRepo);
    }

    private User owner(String name) {
        User u = new User();
        u.setNama(name);
        return u;
    }

    private Project project(String title, Double lat, Double lng) {
        Project p = new Project();
        p.setTitle(title);
        p.setDescription("desc");
        p.setCategory("Multimedia");
        p.setBudget(BigDecimal.valueOf(500000));
        p.setDeadline(LocalDate.now().plusDays(30));
        p.setStatus(ProjectStatus.OPEN);
        p.setOwner(owner("UMKM " + title));
        p.setLatitude(lat);
        p.setLongitude(lng);
        return p;
    }

    @Test
    void filtersOutProjectsBeyondRadius() {
        Project near = project("Near", -6.9100, 107.6100); // ~1.5 km away
        Project far = project("Far", -6.2000, 106.8000); // Jakarta, ~120 km away
        when(projectRepo.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(ProjectStatus.OPEN))
                .thenReturn(Arrays.asList(near, far));

        List<NearbyProjectResponse> result = service.getNearbyProjects(USER_LAT, USER_LNG, 10.0);

        assertEquals(1, result.size());
        assertEquals("Near", result.get(0).title());
    }

    @Test
    void sortsByNearestDistanceFirst() {
        Project closest = project("Closest", -6.9010, 107.6010); // very close
        Project middle = project("Middle", -6.9300, 107.6300); // a few km
        Project farButInRange = project("FarInRange", -6.9700, 107.6700); // farther, still < 25km
        when(projectRepo.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(ProjectStatus.OPEN))
                .thenReturn(Arrays.asList(farButInRange, middle, closest));

        List<NearbyProjectResponse> result = service.getNearbyProjects(USER_LAT, USER_LNG, 25.0);

        assertEquals(3, result.size());
        assertEquals("Closest", result.get(0).title());
        assertEquals("Middle", result.get(1).title());
        assertEquals("FarInRange", result.get(2).title());
        // distances must be non-decreasing
        assertTrue(result.get(0).distanceKm() <= result.get(1).distanceKm());
        assertTrue(result.get(1).distanceKm() <= result.get(2).distanceKm());
    }

    @Test
    void excludesProjectsWithoutCoordinates() {
        Project withCoords = project("HasCoords", -6.9050, 107.6050);
        Project noLat = project("NoLat", null, 107.6050);
        Project noLng = project("NoLng", -6.9050, null);
        when(projectRepo.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(ProjectStatus.OPEN))
                .thenReturn(Arrays.asList(withCoords, noLat, noLng));

        List<NearbyProjectResponse> result = service.getNearbyProjects(USER_LAT, USER_LNG, 25.0);

        assertEquals(1, result.size());
        assertEquals("HasCoords", result.get(0).title());
    }

    @Test
    void includesRoundedDistanceAndOwnerInfo() {
        Project near = project("Near", -6.9100, 107.6100);
        when(projectRepo.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(ProjectStatus.OPEN))
                .thenReturn(List.of(near));

        List<NearbyProjectResponse> result = service.getNearbyProjects(USER_LAT, USER_LNG, 10.0);

        NearbyProjectResponse dto = result.get(0);
        assertNotNull(dto.distanceKm());
        assertTrue(dto.distanceKm() > 0);
        // distance is rounded to 2 decimals
        assertEquals(dto.distanceKm(), Math.round(dto.distanceKm() * 100.0) / 100.0, 0.0);
        assertEquals("UMKM Near", dto.ownerName());
        assertEquals("OPEN", dto.status());
    }

    @Test
    void invalidLatitudeThrows() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.getNearbyProjects(91.0, 107.6, 10.0));
        assertTrue(ex.getMessage().contains("lat"));
    }

    @Test
    void invalidLongitudeThrows() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.getNearbyProjects(-6.9, 181.0, 10.0));
        assertTrue(ex.getMessage().contains("lng"));
    }

    @Test
    void nonPositiveRadiusThrows() {
        assertThrows(IllegalArgumentException.class,
                () -> service.getNearbyProjects(-6.9, 107.6, 0.0));
        assertThrows(IllegalArgumentException.class,
                () -> service.getNearbyProjects(-6.9, 107.6, -5.0));
    }

    @Test
    void radiusIsCappedAtMaximum() {
        // A project ~120 km away must NOT appear even if a huge radius is requested,
        // because the radius is capped at MAX_RADIUS_KM (100 km).
        Project far = project("Far", -6.2000, 106.8000);
        when(projectRepo.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(ProjectStatus.OPEN))
                .thenReturn(List.of(far));

        List<NearbyProjectResponse> result = service.getNearbyProjects(USER_LAT, USER_LNG, 5000.0);

        assertTrue(result.isEmpty());
    }
}
