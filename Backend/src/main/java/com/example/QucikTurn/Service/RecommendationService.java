package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Recommendation Service using Content-Based Filtering (KNN-like approach).
 * 
 * Algorithm: Weighted Jaccard Similarity
 * - Calculates similarity between User skills/preferences and Project requirements.
 * - Scores are based on:
 *   1. Skill Match (High Weight - 0.7): How many user skills match project required skills
 *   2. Category Match (Medium Weight - 0.3): Does user's preferred category match project category
 * 
 * Projects are sorted by score and top K are returned.
 */
@Service
public class RecommendationService {

    private static final double WEIGHT_SKILLS = 0.7;
    private static final double WEIGHT_CATEGORY = 0.3;
    private static final int DEFAULT_LIMIT = 10;

    private final ProjectRepository projectRepo;

    public RecommendationService(ProjectRepository projectRepo) {
        this.projectRepo = projectRepo;
    }

    /**
     * Get recommended projects for a user based on their skills and category preference.
     *
     * @param user  The user to generate recommendations for
     * @param limit Maximum number of recommendations to return
     * @return List of recommended projects sorted by relevance score (descending)
     */
    public List<Project> getRecommendationsForUser(User user, int limit) {
        if (user == null) {
            return Collections.emptyList();
        }

        // Get all open projects
        List<Project> openProjects = projectRepo.findByStatus(ProjectStatus.OPEN);
        
        if (openProjects.isEmpty()) {
            return Collections.emptyList();
        }

        // Parse user's skills into a Set for efficient lookup
        Set<String> userSkills = parseSkills(user.getSkills());
        String userCategory = user.getBidang(); // User's preferred category/field

        // Calculate scores for each project
        List<ScoredProject> scoredProjects = new ArrayList<>();
        for (Project project : openProjects) {
            double score = calculateScore(project, userSkills, userCategory);
            scoredProjects.add(new ScoredProject(project, score));
        }

        // Sort by score descending, then by applicant count (social proof), then by date
        scoredProjects.sort((a, b) -> {
            int scoreCompare = Double.compare(b.score, a.score);
            if (scoreCompare != 0) return scoreCompare;
            
            // Secondary sort: more applicants = more popular
            int applicantCompare = Integer.compare(
                b.project.getApplicantCount() != null ? b.project.getApplicantCount() : 0,
                a.project.getApplicantCount() != null ? a.project.getApplicantCount() : 0
            );
            if (applicantCompare != 0) return applicantCompare;
            
            // Tertiary sort: newer projects first
            return b.project.getCreatedAt().compareTo(a.project.getCreatedAt());
        });

        // Return top K projects
        return scoredProjects.stream()
                .limit(limit > 0 ? limit : DEFAULT_LIMIT)
                .map(sp -> sp.project)
                .collect(Collectors.toList());
    }

    /**
     * Overload with default limit.
     */
    public List<Project> getRecommendationsForUser(User user) {
        return getRecommendationsForUser(user, DEFAULT_LIMIT);
    }

    /**
     * Calculate recommendation score for a project based on user profile.
     * Uses a weighted sum of skill match and category match.
     *
     * @param project      The project to score
     * @param userSkills   Set of user's skills (lowercase, trimmed)
     * @param userCategory User's preferred category
     * @return Score between 0.0 and 1.0
     */
    private double calculateScore(Project project, Set<String> userSkills, String userCategory) {
        double skillScore = 0.0;
        double categoryScore = 0.0;

        // --- Skill Match (Jaccard-like coefficient) ---
        Set<String> projectSkills = parseSkills(project.getRequiredSkills());
        
        if (!projectSkills.isEmpty() && !userSkills.isEmpty()) {
            // Calculate intersection
            Set<String> intersection = new HashSet<>(userSkills);
            intersection.retainAll(projectSkills);
            
            // Jaccard coefficient: |A ∩ B| / |A ∪ B|
            // Modified: We prioritize user having the project's required skills
            // So we use: |intersection| / |projectSkills|
            skillScore = (double) intersection.size() / projectSkills.size();
        } else if (projectSkills.isEmpty()) {
            // If project has no required skills, give neutral score
            skillScore = 0.5;
        }

        // --- Category Match ---
        if (userCategory != null && !userCategory.isBlank() && project.getCategory() != null) {
            String projectCategory = project.getCategory().toLowerCase().trim();
            String userCategoryLower = userCategory.toLowerCase().trim();
            
            if (projectCategory.contains(userCategoryLower) || userCategoryLower.contains(projectCategory)) {
                categoryScore = 1.0;
            } else {
                // Partial match: check for keyword overlap
                String[] projectWords = projectCategory.split("[\\s/,]+");
                String[] userWords = userCategoryLower.split("[\\s/,]+");
                
                for (String pw : projectWords) {
                    for (String uw : userWords) {
                        if (pw.equals(uw) || pw.contains(uw) || uw.contains(pw)) {
                            categoryScore = 0.5;
                            break;
                        }
                    }
                    if (categoryScore > 0) break;
                }
            }
        }

        // Weighted sum
        return (skillScore * WEIGHT_SKILLS) + (categoryScore * WEIGHT_CATEGORY);
    }

    /**
     * Parse comma-separated skills string into a normalized Set.
     * Normalizes by: lowercase, trimming whitespace.
     *
     * @param skillsStr Comma-separated skills (e.g., "Java, React, Node.js")
     * @return Set of normalized skill strings
     */
    private Set<String> parseSkills(String skillsStr) {
        if (skillsStr == null || skillsStr.isBlank()) {
            return Collections.emptySet();
        }
        
        return Arrays.stream(skillsStr.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    /**
     * Internal class to hold project with its calculated score.
     */
    private static class ScoredProject {
        final Project project;
        final double score;

        ScoredProject(Project project, double score) {
            this.project = project;
            this.score = score;
        }
    }
}
