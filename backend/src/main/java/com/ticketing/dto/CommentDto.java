package com.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDto {
    private Long id;
    private String content;
    private UserDto author;
    private Long ticketId;
    private LocalDateTime createdAt;

    @Data
    public static class CreateCommentRequest {
        @NotBlank private String content;
    }
}
