package com.ticketing.service;

import com.ticketing.dto.AttachmentDto;
import com.ticketing.dto.UserDto;
import com.ticketing.entity.Attachment;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.exception.BadRequestException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.repository.AttachmentRepository;
import com.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    public AttachmentDto uploadFile(Long ticketId, MultipartFile file, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) extension = originalFileName.substring(dotIndex);

        String storedFileName = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path targetLocation = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Could not store file: " + e.getMessage());
        }

        Attachment attachment = Attachment.builder()
                .fileName(originalFileName)
                .filePath(storedFileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .ticket(ticket)
                .uploadedBy(currentUser)
                .build();

        Attachment saved = attachmentRepository.save(attachment);
        return mapToDto(saved);
    }

    public Resource loadFile(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) return resource;
            throw new ResourceNotFoundException("File not found");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found");
        }
    }

    private AttachmentDto mapToDto(Attachment a) {
        AttachmentDto dto = new AttachmentDto();
        dto.setId(a.getId());
        dto.setFileName(a.getFileName());
        dto.setFileType(a.getFileType());
        dto.setFileSize(a.getFileSize());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setDownloadUrl("/api/tickets/" + a.getTicket().getId() + "/attachments/" + a.getId());
        return dto;
    }
}
