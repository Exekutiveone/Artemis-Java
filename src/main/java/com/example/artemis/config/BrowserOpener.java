package com.example.artemis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.net.URI;

@Component
public class BrowserOpener {
    @Value("${server.port:8080}")
    private String serverPort;

    @EventListener(ApplicationReadyEvent.class)
    public void openBrowser() {
        try {
            if (GraphicsEnvironment.isHeadless()) return;
            if (!Desktop.isDesktopSupported()) return;
            Desktop.getDesktop().browse(new URI("http://localhost:" + serverPort));
        } catch (Exception ignored) {}
    }
}
