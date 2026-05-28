package com.ticketing.config;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.enums.Priority;
import com.ticketing.enums.Role;
import com.ticketing.enums.TicketStatus;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return; // already seeded

        log.info("Seeding demo data...");

        // Create Admin
        User admin = User.builder()
                .name("Admin User")
                .email("admin@demo.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .active(true)
                .build();

        // Create Support Agent
        User agent = User.builder()
                .name("Support Agent")
                .email("agent@demo.com")
                .password(passwordEncoder.encode("agent123"))
                .role(Role.SUPPORT_AGENT)
                .active(true)
                .build();

        // Create Regular User
        User user = User.builder()
                .name("John Doe")
                .email("user@demo.com")
                .password(passwordEncoder.encode("user123"))
                .role(Role.USER)
                .active(true)
                .build();

        userRepository.saveAll(List.of(admin, agent, user));

        // Create Sample Tickets
        List<Ticket> tickets = List.of(
            Ticket.builder().subject("Cannot login to account").description("I am unable to login to my account since yesterday. Getting error 401.").priority(Priority.HIGH).status(TicketStatus.OPEN).createdBy(user).build(),
            Ticket.builder().subject("Payment not processed").description("I made a payment 3 days ago but it has not been processed yet.").priority(Priority.URGENT).status(TicketStatus.IN_PROGRESS).createdBy(user).assignedTo(agent).build(),
            Ticket.builder().subject("Feature request: Dark mode").description("It would be great to have a dark mode option in the settings.").priority(Priority.LOW).status(TicketStatus.OPEN).createdBy(user).build(),
            Ticket.builder().subject("App crashes on startup").description("The mobile app crashes every time I open it on Android 12.").priority(Priority.HIGH).status(TicketStatus.RESOLVED).createdBy(user).assignedTo(agent).build(),
            Ticket.builder().subject("Wrong invoice amount").description("My invoice #INV-2024-001 shows wrong amount. Should be $99 not $199.").priority(Priority.MEDIUM).status(TicketStatus.CLOSED).createdBy(user).build()
        );

        ticketRepository.saveAll(tickets);
        log.info("Demo data seeded successfully!");
        log.info("Admin: admin@demo.com / admin123");
        log.info("Agent: agent@demo.com / agent123");
        log.info("User:  user@demo.com  / user123");
    }
}
