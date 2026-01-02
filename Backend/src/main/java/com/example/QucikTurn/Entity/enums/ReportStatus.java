package com.example.QucikTurn.Entity.enums;

/**
 * Status of a user report.
 */
public enum ReportStatus {
    /**
     * Report has been submitted and awaiting review
     */
    PENDING,

    /**
     * Report is being investigated by admin
     */
    IN_REVIEW,

    /**
     * Report has been resolved
     */
    RESOLVED,

    /**
     * Report was closed without action (invalid/duplicate)
     */
    CLOSED
}
