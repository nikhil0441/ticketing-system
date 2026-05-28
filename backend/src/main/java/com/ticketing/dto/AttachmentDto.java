package com.ticketing.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long ticketId;
    private UserDto uploadedBy;
    private LocalDateTime createdAt;
    private String downloadUrl;
}
