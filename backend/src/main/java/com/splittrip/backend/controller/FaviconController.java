package com.splittrip.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FaviconController {

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        // Respond with 204 to avoid 500 errors when no favicon is provided
        return ResponseEntity.noContent().build();
    }
}
