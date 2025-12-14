package com.tomato.todo.backend.util;

import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * 密码工具类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
public class PasswordUtil {

    private static final int SALT_LENGTH = 32;
    private static final int ITERATIONS = 10000;
    private static final int KEY_LENGTH = 256;
    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";

    /**
     * 加密密码
     *
     * @param password 明文密码
     * @return 加密后的密码哈希
     */
    public static String encode(String password) {
        try {
            // 生成随机盐值
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[SALT_LENGTH];
            random.nextBytes(salt);

            // 使用PBKDF2算法加密
            byte[] hash = hashPassword(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);

            // 将盐值和哈希值合并
            byte[] combined = new byte[salt.length + hash.length];
            System.arraycopy(salt, 0, combined, 0, salt.length);
            System.arraycopy(hash, 0, combined, salt.length, hash.length);

            // 返回Base64编码的结果
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            log.error("密码加密失败: {}", e.getMessage());
            throw new RuntimeException("密码加密失败", e);
        }
    }

    /**
     * 验证密码
     *
     * @param password 明文密码
     * @param encodedPassword 加密后的密码哈希
     * @return 是否匹配
     */
    public static boolean matches(String password, String encodedPassword) {
        try {
            // 解码Base64字符串
            byte[] combined = Base64.getDecoder().decode(encodedPassword);

            // 提取盐值和哈希值
            byte[] salt = new byte[SALT_LENGTH];
            byte[] storedHash = new byte[combined.length - SALT_LENGTH];
            System.arraycopy(combined, 0, salt, 0, salt.length);
            System.arraycopy(combined, salt.length, storedHash, 0, storedHash.length);

            // 计算输入密码的哈希值
            byte[] computedHash = hashPassword(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);

            // 比较哈希值
            return slowEquals(storedHash, computedHash);
        } catch (Exception e) {
            log.error("密码验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 使用PBKDF2算法生成密码哈希
     *
     * @param password 明文密码
     * @param salt 盐值
     * @param iterations 迭代次数
     * @param keyLength 密钥长度
     * @return 密码哈希
     */
    private static byte[] hashPassword(char[] password, byte[] salt, int iterations, int keyLength) {
        try {
            javax.crypto.SecretKeyFactory skf = javax.crypto.SecretKeyFactory.getInstance(ALGORITHM);
            javax.crypto.spec.PBEKeySpec spec = new javax.crypto.spec.PBEKeySpec(password, salt, iterations, keyLength);
            return skf.generateSecret(spec).getEncoded();
        } catch (Exception e) {
            log.error("密码哈希生成失败: {}", e.getMessage());
            throw new RuntimeException("密码哈希生成失败", e);
        }
    }

    /**
     * 安全比较两个字节数组，防止时间攻击
     *
     * @param a 字节数组A
     * @param b 字节数组B
     * @return 是否相等
     */
    private static boolean slowEquals(byte[] a, byte[] b) {
        int diff = a.length ^ b.length;
        for (int i = 0; i < a.length && i < b.length; i++) {
            diff |= a[i] ^ b[i];
        }
        return diff == 0;
    }

    /**
     * 生成随机密码
     *
     * @param length 密码长度
     * @return 随机密码
     */
    public static String generateRandomPassword(int length) {
        if (length < 8) {
            length = 8;
        }

        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }

    /**
     * 检查密码强度
     *
     * @param password 密码
     * @return 密码强度等级 (0-4: 很弱, 弱, 中等, 强, 很强)
     */
    public static int checkPasswordStrength(String password) {
        int strength = 0;

        // 长度检查
        if (password.length() >= 8) {
            strength++;
        }
        if (password.length() >= 12) {
            strength++;
        }

        // 复杂性检查
        boolean hasLower = password.matches(".*[a-z].*");
        boolean hasUpper = password.matches(".*[A-Z].*");
        boolean hasNumber = password.matches(".*[0-9].*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

        int complexity = 0;
        if (hasLower) complexity++;
        if (hasUpper) complexity++;
        if (hasNumber) complexity++;
        if (hasSpecial) complexity++;

        if (complexity >= 3) {
            strength++;
        }
        if (complexity == 4) {
            strength++;
        }

        return Math.min(strength, 4);
    }

    /**
     * 获取密码强度描述
     *
     * @param strength 密码强度等级
     * @return 强度描述
     */
    public static String getPasswordStrengthDescription(int strength) {
        switch (strength) {
            case 0:
            case 1:
                return "弱";
            case 2:
                return "中等";
            case 3:
                return "强";
            case 4:
                return "很强";
            default:
                return "未知";
        }
    }
}