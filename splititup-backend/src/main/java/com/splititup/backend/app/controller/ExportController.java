package com.splititup.backend.app.controller;

import com.splititup.backend.app.service.ExportService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.splititup.backend.common.security.SecurityUtils.currentUser;

@RestController
@RequestMapping("/api/v1/exports")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] content = exportService.buildCsv(currentUser());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(ContentDisposition.attachment().filename("splititup-export.csv").build());
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] content = exportService.buildPdf(currentUser());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("splititup-summary.pdf").build());
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }
}
