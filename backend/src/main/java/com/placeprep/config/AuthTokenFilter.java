package com.placeprep.config;

import com.placeprep.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null) {
            TokenService.TokenData tokenData = tokenService.validateToken(token);
            var currentUser = tokenData == null ? java.util.Optional.<com.placeprep.model.User>empty()
                    : userRepository.findById(tokenData.getUserId());
            if (currentUser.isPresent() && !"SUSPENDED".equalsIgnoreCase(currentUser.get().getStatus())) {
                String role = currentUser.get().getRole() != null ? currentUser.get().getRole().toUpperCase() : "STUDENT";
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        currentUser.get().getEmail(),
                        null,
                        Collections.singletonList(authority)
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                request.setAttribute("currentUserId", tokenData.getUserId());
                request.setAttribute("currentUserEmail", currentUser.get().getEmail());
                request.setAttribute("currentUserRole", currentUser.get().getRole());

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        String xAuth = request.getHeader("X-Auth-Token");
        if (xAuth != null && !xAuth.trim().isEmpty()) {
            return xAuth.trim();
        }
        return null;
    }
}
