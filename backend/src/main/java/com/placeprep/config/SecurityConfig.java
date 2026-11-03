package com.placeprep.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public authentication & info
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/bulk-register").hasAnyRole("ADMIN", "HOD", "TEACHER", "FACULTY", "TPO", "MANAGEMENT")
                        .requestMatchers("/api/auth/users", "/api/auth/user/**").hasAnyRole("ADMIN", "HOD", "TEACHER", "FACULTY", "TPO", "MANAGEMENT", "DIRECTOR", "COORDINATOR")
                        .requestMatchers("/api/auth/**").authenticated()
                        .requestMatchers("/api/resume-ats/**").permitAll()
                        .requestMatchers("/api/academics/**").permitAll()
                        .requestMatchers("/api/opportunities/**").permitAll()
                        .requestMatchers("/api/dsa/**").permitAll()
                        .requestMatchers("/api/schedules/**").permitAll()
                        .requestMatchers("/api/notifications/**").permitAll()
                        .requestMatchers("/api/eligibility/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        
                        // Public reads & public interactions
                        .requestMatchers(HttpMethod.GET, "/api/companies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/drives/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/questions/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/insights/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/experiences/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feedback/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/workflow/candidates/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/experiences/*/vote").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/feedback").permitAll()
                        
                        // Management, TPO, Faculty & Admin role-specific write actions
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/companies/**").hasAnyRole("ADMIN", "TPO", "MANAGEMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/companies/**").hasAnyRole("ADMIN", "TPO", "MANAGEMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**").hasAnyRole("ADMIN", "TPO", "MANAGEMENT")
                        .requestMatchers(HttpMethod.POST, "/api/drives/**").hasAnyRole("ADMIN", "TPO", "MANAGEMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/drives/**").hasAnyRole("ADMIN", "TPO", "MANAGEMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/drives/**").hasAnyRole("ADMIN", "TPO", "MANAGEMENT")
                        .requestMatchers(HttpMethod.POST, "/api/questions/**").hasAnyRole("ADMIN", "FACULTY", "HOD", "TPO")
                        .requestMatchers(HttpMethod.PUT, "/api/questions/**").hasAnyRole("ADMIN", "FACULTY", "HOD", "TPO")
                        .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasAnyRole("ADMIN", "FACULTY", "HOD", "TPO")
                        .requestMatchers(HttpMethod.POST, "/api/experiences/*/moderate").hasAnyRole("ADMIN", "FACULTY", "HOD", "TPO")

                        // Management restricted endpoints
                        .requestMatchers("/api/management/attendance/verify-location").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/management/timetables/student/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/management/timetables/*/file").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/management/timetables/version/*/file").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/management/timetables/*/preview-data").permitAll()
                        .requestMatchers("/api/management/**").hasAnyRole("MANAGEMENT", "ADMIN")

                        // Authenticated student/user actions & attendance verification
                        .requestMatchers("/api/student/attendance/status").permitAll()
                        .requestMatchers("/api/student/attendance/verify-location").permitAll()
                        .requestMatchers("/api/student/attendance/verify-face").permitAll()
                        .requestMatchers("/api/student/attendance/mark").permitAll()
                        .requestMatchers("/api/users/profile/**", "/api/users/profile").permitAll()
                        .requestMatchers("/api/users/me/**").authenticated()
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/student/attendance/subjects", "/api/student/attendance/subjects/**", "/api/student/attendance/history").authenticated()
                        .requestMatchers("/api/student/attendance/**").permitAll()
                        .requestMatchers("/api/mock-sessions/**").authenticated()
                        .requestMatchers("/api/applications/my").permitAll()
                        .requestMatchers("/api/applications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/experiences").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/experiences/*/report").authenticated()
                        .requestMatchers("/api/workflow/**").authenticated()

                        // HOD Faculty Operations Monitoring - restricted strictly to HOD & ADMIN
                        .requestMatchers("/api/hod/**").hasAnyRole("HOD", "ADMIN")

                        // Attendance Portal Role Authorization:
                        // Marking class attendance requires TEACHER, HOD, or ADMIN role
                        .requestMatchers(HttpMethod.POST, "/api/attendance/class/**").hasAnyRole("TEACHER", "HOD", "ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.POST, "/api/attendance/crt/**").hasAnyRole("TEACHER", "HOD", "ADMIN", "FACULTY", "TPO")
                        .requestMatchers(HttpMethod.PUT, "/api/attendance/crt/**").hasAnyRole("TEACHER", "HOD", "ADMIN", "FACULTY", "TPO")
                        .requestMatchers(HttpMethod.PATCH, "/api/attendance/crt/**").hasAnyRole("TEACHER", "HOD", "ADMIN", "FACULTY", "TPO")
                        .requestMatchers(HttpMethod.GET, "/api/attendance/student/*/summary").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/attendance/**").permitAll()
                        .requestMatchers("/api/ai/**").authenticated()
                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Auth-Token", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
