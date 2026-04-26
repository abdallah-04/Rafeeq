package com.rafeeq.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rafeeq.backend.auth.JwtAuthenticationFilter;
import com.rafeeq.backend.common.ApiErrorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Value("#{'${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081}'.split(',')}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType("application/json");
                            objectMapper.writeValue(
                                    response.getWriter(),
                                    new ApiErrorResponse(false, "Authentication required", "UNAUTHORIZED", LocalDateTime.now())
                            );
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType("application/json");
                            objectMapper.writeValue(
                                    response.getWriter(),
                                    new ApiErrorResponse(false, "You are not allowed to access this resource", "FORBIDDEN", LocalDateTime.now())
                            );
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/register/**",
                                "/auth/login",
                                "/auth/forgot-password",
                                "/auth/verify-otp",
                                "/auth/reset-password",
                                "/auth/refresh",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/test/**",
                                "/auth/logout",
                                "/ping",
                                "/auth/resend-otp"
                        ).permitAll()
                        .requestMatchers("/school/**", "/api/school/**").hasRole("SCHOOL")
                        .requestMatchers("/teacher/**", "/api/teacher/**").hasRole("TEACHER")
                        .requestMatchers("/parent/**", "/children/**", "/api/parent/**").hasRole("PARENT")
                        .requestMatchers("/api/dashboard/school").hasRole("SCHOOL")
                        .requestMatchers("/api/dashboard/teacher").hasRole("TEACHER")
                        .requestMatchers("/api/dashboard/parent").hasRole("PARENT")
                        .requestMatchers(HttpMethod.POST, "/api/notes/**", "/api/homework/**", "/api/reports/**").hasRole("TEACHER")
                        .requestMatchers("/api/notes/teacher/**", "/api/homework/teacher/**", "/api/reports/teacher/**").hasRole("TEACHER")
                        .requestMatchers("/api/notes/parent/**", "/api/homework/parent/**", "/api/reports/parent/**").hasRole("PARENT")
                        .requestMatchers(HttpMethod.PATCH, "/api/tree/items/*/complete").hasAnyRole("PARENT", "CHILD")
                        .requestMatchers(HttpMethod.POST, "/api/quizzes/*/submit").hasAnyRole("PARENT", "CHILD")
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/articles/**").authenticated()
                        .requestMatchers("/auth/me").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins.stream().map(String::trim).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
