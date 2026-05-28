package com.ticketing.service;

import com.ticketing.dto.UserDto;
import com.ticketing.entity.User;
import com.ticketing.enums.Role;
import com.ticketing.exception.BadRequestException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getAgents() {
        return userRepository.findByRole(Role.SUPPORT_AGENT).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return mapToDto(findById(id));
    }

    public UserDto createUser(UserDto.CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();
        return mapToDto(userRepository.save(user));
    }

    public UserDto updateUser(Long id, UserDto.UpdateUserRequest request) {
        User user = findById(id);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getActive() != null) user.setActive(request.getActive());
        return mapToDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    public UserDto getCurrentUser(User user) {
        return mapToDto(user);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
