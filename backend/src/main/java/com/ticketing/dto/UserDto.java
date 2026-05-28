package com.ticketing.dto;

import com.ticketing.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;

    @Data
    public static class CreateUserRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank private String password;
        @NotNull private Role role;
    }

    @Data
    public static class UpdateUserRequest {
        private String name;
        private Role role;
        private Boolean active;
    }
}
