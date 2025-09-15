package com.example.artemis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class DatabaseConfig {
    @Bean
    public DataSource dataSource() throws IOException {
        Path dir = Paths.get("Data Base");
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
        String url = "jdbc:sqlite:" + dir.resolve("assets.db").toString() + "?foreign_keys=on";
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.sqlite.JDBC");
        ds.setUrl(url);
        return ds;
    }
}
