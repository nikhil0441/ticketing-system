package com.ticketing.repository;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.enums.Priority;
import com.ticketing.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByCreatedBy(User user, Pageable pageable);

    Page<Ticket> findByAssignedTo(User agent, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findWithFilters(
        @Param("status") TicketStatus status,
        @Param("priority") Priority priority,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT t FROM Ticket t WHERE t.createdBy = :user AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findByUserWithFilters(
        @Param("user") User user,
        @Param("status") TicketStatus status,
        @Param("priority") Priority priority,
        @Param("search") String search,
        Pageable pageable
    );

    long countByStatus(TicketStatus status);
    long countByCreatedBy(User user);
    long countByAssignedTo(User agent);
    long countByCreatedByAndStatus(User user, TicketStatus status);
}
