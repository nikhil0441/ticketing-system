package com.ticketing.dto;

import com.ticketing.enums.Priority;
import com.ticketing.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketDto {
    private Long id;
    private String subject;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private UserDto createdBy;
    private UserDto assignedTo;
    private List<CommentDto> comments;
    private List<AttachmentDto> attachments;
    private Integer rating;
    private String ratingFeedback;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class CreateTicketRequest {
        @NotBlank private String subject;
        @NotBlank private String description;
        @NotNull private Priority priority;
    }

    @Data
    public static class UpdateTicketRequest {
        private String subject;
        private String description;
        private Priority priority;
        private TicketStatus status;
        private Long assignedToId;
    }

    @Data
    public static class AssignTicketRequest {
        @NotNull private Long agentId;
    }

    @Data
    public static class RateTicketRequest {
        @NotNull private Integer rating;
        private String feedback;
    }
}
