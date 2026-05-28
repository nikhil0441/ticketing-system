package com.ticketing.service;

import com.ticketing.dto.*;
import com.ticketing.entity.*;
import com.ticketing.enums.Priority;
import com.ticketing.enums.Role;
import com.ticketing.enums.TicketStatus;
import com.ticketing.exception.BadRequestException;
import com.ticketing.exception.ForbiddenException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;

    public TicketDto createTicket(TicketDto.CreateTicketRequest request, User currentUser) {
        Ticket ticket = Ticket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .createdBy(currentUser)
                .build();

        return mapToDto(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public Page<TicketDto> getTickets(User currentUser, TicketStatus status, Priority priority,
                                      String search, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));

        Page<Ticket> tickets;
        if (currentUser.getRole() == Role.ADMIN) {
            tickets = ticketRepository.findWithFilters(status, priority, search, pageable);
        } else if (currentUser.getRole() == Role.SUPPORT_AGENT) {
            tickets = ticketRepository.findByAssignedTo(currentUser, pageable);
        } else {
            tickets = ticketRepository.findByUserWithFilters(currentUser, status, priority, search, pageable);
        }

        return tickets.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public TicketDto getTicketById(Long id, User currentUser) {
        Ticket ticket = findTicketById(id);
        validateAccess(ticket, currentUser);
        return mapToDto(ticket);
    }

    public TicketDto updateTicket(Long id, TicketDto.UpdateTicketRequest request, User currentUser) {
        Ticket ticket = findTicketById(id);

        if (currentUser.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Access denied");
        }

        if (request.getSubject() != null) ticket.setSubject(request.getSubject());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());

        if (request.getStatus() != null) {
            if (currentUser.getRole() == Role.USER) {
                throw new ForbiddenException("Users cannot change ticket status");
            }
            ticket.setStatus(request.getStatus());
            if (request.getStatus() == TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getAssignedToId() != null) {
            if (currentUser.getRole() == Role.USER) {
                throw new ForbiddenException("Users cannot assign tickets");
            }
            User agent = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            ticket.setAssignedTo(agent);
            if (ticket.getStatus() == TicketStatus.OPEN) {
                ticket.setStatus(TicketStatus.IN_PROGRESS);
            }
        }

        return mapToDto(ticketRepository.save(ticket));
    }

    public TicketDto assignTicket(Long id, TicketDto.AssignTicketRequest request, User currentUser) {
        Ticket ticket = findTicketById(id);

        if (currentUser.getRole() == Role.USER) {
            throw new ForbiddenException("Users cannot assign tickets");
        }

        User agent = userRepository.findById(request.getAgentId())
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        if (agent.getRole() == Role.USER) {
            throw new BadRequestException("Can only assign to support agents or admins");
        }

        ticket.setAssignedTo(agent);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return mapToDto(ticketRepository.save(ticket));
    }

    public CommentDto addComment(Long ticketId, CommentDto.CreateCommentRequest request, User currentUser) {
        Ticket ticket = findTicketById(ticketId);
        validateAccess(ticket, currentUser);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .ticket(ticket)
                .author(currentUser)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapCommentToDto(saved);
    }

    public TicketDto rateTicket(Long id, TicketDto.RateTicketRequest request, User currentUser) {
        Ticket ticket = findTicketById(id);

        if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only ticket creator can rate");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Can only rate resolved/closed tickets");
        }
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        ticket.setRating(request.getRating());
        ticket.setRatingFeedback(request.getFeedback());

        return mapToDto(ticketRepository.save(ticket));
    }

    public DashboardStatsDto getStats(User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return DashboardStatsDto.builder()
                    .totalTickets(ticketRepository.count())
                    .openTickets(ticketRepository.countByStatus(TicketStatus.OPEN))
                    .inProgressTickets(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS))
                    .resolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED))
                    .closedTickets(ticketRepository.countByStatus(TicketStatus.CLOSED))
                    .totalUsers(userRepository.findByRole(Role.USER).size())
                    .totalAgents(userRepository.findByRole(Role.SUPPORT_AGENT).size())
                    .build();
        } else {
            return DashboardStatsDto.builder()
                    .totalTickets(ticketRepository.countByCreatedBy(currentUser))
                    .openTickets(ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.OPEN))
                    .inProgressTickets(ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.IN_PROGRESS))
                    .resolvedTickets(ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.RESOLVED))
                    .closedTickets(ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.CLOSED))
                    .build();
        }
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private void validateAccess(Ticket ticket, User user) {
        if (user.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied to this ticket");
        }
    }

    public TicketDto mapToDto(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setSubject(ticket.getSubject());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setRating(ticket.getRating());
        dto.setRatingFeedback(ticket.getRatingFeedback());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());

        if (ticket.getCreatedBy() != null) dto.setCreatedBy(mapUserToDto(ticket.getCreatedBy()));
        if (ticket.getAssignedTo() != null) dto.setAssignedTo(mapUserToDto(ticket.getAssignedTo()));

        if (ticket.getComments() != null) {
            dto.setComments(ticket.getComments().stream().map(this::mapCommentToDto).collect(Collectors.toList()));
        }

        if (ticket.getAttachments() != null) {
            dto.setAttachments(ticket.getAttachments().stream().map(this::mapAttachmentToDto).collect(Collectors.toList()));
        }

        return dto;
    }

    private UserDto mapUserToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private CommentDto mapCommentToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setTicketId(comment.getTicket().getId());
        if (comment.getAuthor() != null) dto.setAuthor(mapUserToDto(comment.getAuthor()));
        return dto;
    }

    private AttachmentDto mapAttachmentToDto(Attachment attachment) {
        AttachmentDto dto = new AttachmentDto();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setCreatedAt(attachment.getCreatedAt());
        dto.setDownloadUrl("/api/tickets/" + attachment.getTicket().getId() + "/attachments/" + attachment.getId());
        if (attachment.getUploadedBy() != null) dto.setUploadedBy(mapUserToDto(attachment.getUploadedBy()));
        return dto;
    }
}
