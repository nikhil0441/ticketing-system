package com.ticketing.controller;

import com.ticketing.dto.*;
import com.ticketing.entity.User;
import com.ticketing.enums.Priority;
import com.ticketing.enums.TicketStatus;
import com.ticketing.service.FileStorageService;
import com.ticketing.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<TicketDto> createTicket(
            @Valid @RequestBody TicketDto.CreateTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<TicketDto>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getTickets(currentUser, status, priority, search, page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getTicketById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDto> updateTicket(
            @PathVariable Long id,
            @RequestBody TicketDto.UpdateTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<TicketDto> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketDto.AssignTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentDto.CreateCommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, request, currentUser));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<TicketDto> rateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketDto.RateTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.rateTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(fileStorageService.uploadFile(id, file, currentUser));
    }

    @GetMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        Resource resource = fileStorageService.loadFile(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getStats(currentUser));
    }
}
