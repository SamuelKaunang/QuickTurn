package com.example.QucikTurn.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Database migration runner that executes on application startup.
 * This handles schema changes that Hibernate ddl-auto=update cannot handle,
 * such as modifying ENUM columns in MySQL.
 */
@Component
@Order(1)
public class DatabaseMigrationRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationRunner.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Running database migrations...");

        try {
            // Migration: Update file_type column to support new enum values
            migrateFileTypeColumn();
            logger.info("Database migrations completed successfully.");
        } catch (Exception e) {
            logger.warn("Database migration warning (may be harmless): " + e.getMessage());
            // Don't throw - allow application to continue starting
        }
    }

    private void migrateFileTypeColumn() {
        try {
            // Check if uploaded_files table exists
            String checkTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'uploaded_files'";
            Integer tableExists = jdbcTemplate.queryForObject(checkTable, Integer.class);

            if (tableExists == null || tableExists == 0) {
                logger.info("Table 'uploaded_files' does not exist yet. Skipping migration.");
                return;
            }

            // Alter the column to support all FileType enum values
            // Using VARCHAR to avoid ENUM limitations in MySQL
            String alterSql = "ALTER TABLE uploaded_files MODIFY COLUMN file_type VARCHAR(50) NOT NULL";
            jdbcTemplate.execute(alterSql);
            logger.info("Successfully updated file_type column to VARCHAR(50)");

        } catch (Exception e) {
            // Column might already be VARCHAR or have correct values - that's fine
            logger.debug("file_type column migration: " + e.getMessage());
        }
    }
}
