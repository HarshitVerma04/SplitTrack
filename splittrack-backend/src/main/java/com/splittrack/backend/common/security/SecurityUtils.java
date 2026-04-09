package com.splittrack.backend.common.security;

import com.splittrack.backend.auth.entity.User;
import com.splittrack.backend.common.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Centralised helper supplying the currently-authenticated {@link User}.
 * Replaces the identical {@code currentUser()} private methods that were
 * duplicated in every controller.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * @return the authenticated {@link User} principal
     * @throws AppException with 401 if no authenticated user is present
     */
    public static User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return user;
    }
}
