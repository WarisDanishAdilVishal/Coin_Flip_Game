package com.casino.coinflip.security;

import com.casino.coinflip.entity.User;
import com.casino.coinflip.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Loading user by username: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });
        
        // Check if user is active
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            logger.error("User account is not active: {}, status: {}", username, user.getStatus());
            throw new UsernameNotFoundException("User account is " + user.getStatus().toString().toLowerCase());
        }
        
        logger.debug("User {} loaded successfully with {} roles", username, user.getRoles().size());
        
        return new CustomUserDetails(user);
    }

    // Helper method to convert our User entity to UserDetails
    public static UserDetails createUserDetails(User user) {
        return new CustomUserDetails(user);
    }
    
    // Custom UserDetails implementation that wraps our User entity
    public static class CustomUserDetails implements UserDetails {
        private final User user;
        
        public CustomUserDetails(User user) {
            this.user = user;
        }
        
        public User getUser() {
            return user;
        }
        
        @Override
        public Collection<SimpleGrantedAuthority> getAuthorities() {
            return user.getRoles().stream()
                    .map(role -> {
                        // Ensure the role has the ROLE_ prefix
                        if (!role.startsWith("ROLE_")) {
                            return new SimpleGrantedAuthority("ROLE_" + role);
                        }
                        return new SimpleGrantedAuthority(role);
                    })
                    .collect(Collectors.toList());
        }
        
        @Override
        public String getPassword() {
            return user.getPassword();
        }
        
        @Override
        public String getUsername() {
            return user.getUsername();
        }
        
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }
        
        @Override
        public boolean isAccountNonLocked() {
            return user.getStatus() != User.UserStatus.BLOCKED;
        }
        
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }
        
        @Override
        public boolean isEnabled() {
            return user.getStatus() == User.UserStatus.ACTIVE;
        }
    }
} 