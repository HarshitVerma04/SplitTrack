package com.splittrack.backend.auth.service;

import com.splittrack.backend.auth.entity.RefreshToken;
import com.splittrack.backend.auth.entity.User;
import com.splittrack.backend.auth.repository.RefreshTokenRepository;
import com.splittrack.backend.common.exception.AppException;
import com.splittrack.backend.config.JwtProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public RefreshToken issueToken(User user) {
        revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(generateTokenValue())
                .user(user)
                .expiresAt(OffsetDateTime.now().plusDays(jwtProperties.getRefreshTokenDays()))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeAllByUser(User user) {
        refreshTokenRepository.revokeAllActiveByUser(user);
    }

    @Transactional(readOnly = true)
    public RefreshToken validate(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (token.isRevoked()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }

        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token has expired");
        }

        return token;
    }

    private String generateTokenValue() {
        byte[] random = new byte[64];
        SECURE_RANDOM.nextBytes(random);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(random);
    }
}
