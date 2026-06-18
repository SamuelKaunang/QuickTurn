package com.example.QucikTurn.Entity.enums;

/**
 * Work arrangement for a project, indicating how location-dependent it is.
 * Helps talents understand whether physical presence is required.
 */
public enum WorkMode {
    REMOTE, // Fully remote, location is informational only
    HYBRID, // Mix of remote and on-site
    ONSITE // Requires physical presence at the project location
}
