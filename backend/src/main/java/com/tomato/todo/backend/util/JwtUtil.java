package com.tomato.todo.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT工具类 - 提供Token生成、验证、刷新等功能
 * 兼容 JJWT 0.12.3 版本
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
public class JwtUtil {

    private static final String JWT_SECRET = "mySecretKeyForTomatoTodoAppThatIsLongEnoughToMeetHS256Requirements1234567890";
    private static final long JWT_EXPIRATION = 24 * 60 * 60 * 1000L; // 24小时
    private static final long JWT_REFRESH_EXPIRATION = 7 * 24 * 60 * 60 * 1000L; // 7天

    private static final SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes());

    /**
     * 生成Token
     *
     * @param userId 用户ID
     * @param username 用户名
     * @return JWT Token
     */
    public static String generateToken(Long userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 生成刷新Token
     *
     * @param userId 用户ID
     * @return 刷新Token
     */
    public static String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_REFRESH_EXPIRATION);

        return Jwts.builder()
                .subject("refresh")
                .claim("userId", userId)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 从Token中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public static String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("从Token中获取用户名失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public static Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            log.error("从Token中获取用户ID失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证Token是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public static boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException e) {
            log.error("Token签名验证失败: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Token格式错误: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Token已过期: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("不支持的Token类型: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Token参数非法: {}", e.getMessage());
        }
        return false;
    }

    /**
     * 验证刷新Token是否有效
     *
     * @param refreshToken 刷新Token
     * @return 是否有效
     */
    public static boolean validateRefreshToken(String refreshToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();

            // 验证是否为刷新Token
            String type = claims.get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception e) {
            log.error("刷新Token验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 刷新Token
     *
     * @param refreshToken 刷新Token
     * @return 新的访问Token
     */
    public static String refreshToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            return null;
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();

            Long userId = claims.get("userId", Long.class);
            String username = claims.getSubject();

            return generateToken(userId, username);
        } catch (Exception e) {
            log.error("刷新Token失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中获取过期时间
     *
     * @param token JWT Token
     * @return 过期时间
     */
    public static Date getExpirationDateFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getExpiration();
        } catch (Exception e) {
            log.error("从Token中获取过期时间失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 检查Token是否即将过期（剩余时间少于1小时）
     *
     * @param token JWT Token
     * @return 是否即将过期
     */
    public static boolean isTokenExpiringSoon(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            if (expiration == null) {
                return true;
            }

            long currentTime = System.currentTimeMillis();
            long oneHour = 60 * 60 * 1000L;
            return (expiration.getTime() - currentTime) < oneHour;
        } catch (Exception e) {
            log.error("检查Token过期时间失败: {}", e.getMessage());
            return true;
        }
    }
}