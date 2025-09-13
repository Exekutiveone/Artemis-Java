package com.example.artemis.db;

import java.nio.file.*;
import java.sql.*;
import java.util.Scanner;

/**
 * Provides a singleton SQLite connection and ensures the schema
 * defined in {@code schema.sql} is created on first access.
 */
public class Db {
    private static Connection INSTANCE;

    /**
     * Returns the shared database connection. Creates the database file in
     * {@code ~/.ares/ares_fleet.db} if it does not exist.
     */
    public static Connection get() throws SQLException {
        if (INSTANCE == null || INSTANCE.isClosed()) {
            Path dbPath = Paths.get(System.getProperty("user.home"), ".ares", "ares_fleet.db");
            try {
                Files.createDirectories(dbPath.getParent());
            } catch (Exception ignore) {}
            String url = "jdbc:sqlite:" + dbPath;
            INSTANCE = DriverManager.getConnection(url);
            try (Statement s = INSTANCE.createStatement()) {
                s.execute("PRAGMA foreign_keys = ON");
            }
            migrateIfEmpty(INSTANCE);
        }
        return INSTANCE;
    }

    private static void migrateIfEmpty(Connection c) {
        try (Statement s = c.createStatement();
             ResultSet rs = s.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='assets'")) {
            if (!rs.next()) {
                try (var in = Db.class.getResourceAsStream("/schema.sql")) {
                    if (in == null) throw new IllegalStateException("schema.sql not found");
                    String ddl = new Scanner(in, "UTF-8").useDelimiter("\\A").next();
                    for (String stmt : ddl.split(";\\s*\n")) {
                        String trimmed = stmt.trim();
                        if (!trimmed.isEmpty()) {
                            try (Statement st = c.createStatement()) {
                                st.execute(trimmed);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Migration failed", e);
        }
    }
}
