package com.ticketing.dto;

import com.ticketing.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min = 2, max = 100)
        private String name;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private UserDto user;

        public AuthResponse(String token, String refreshToken, UserDto user) {
            this.token = token;
            this.refreshToken = refreshToken;
            this.user = user;
        }
    }
}
