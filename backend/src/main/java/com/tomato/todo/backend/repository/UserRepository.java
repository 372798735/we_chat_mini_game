package com.tomato.todo.backend.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tomato.todo.backend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

/**
 * 用户数据访问层
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Mapper
public interface UserRepository extends BaseMapper<User> {

    /**
     * 根据用户名查找用户
     */
    @Select("SELECT * FROM t_user WHERE username = #{username} AND deleted = 0")
    User findByUsername(@Param("username") String username);

    /**
     * 根据邮箱查找用户
     */
    @Select("SELECT * FROM t_user WHERE email = #{email} AND deleted = 0")
    User findByEmail(@Param("email") String email);

    /**
     * 检查用户名是否存在
     */
    @Select("SELECT COUNT(*) FROM t_user WHERE username = #{username} AND deleted = 0")
    boolean existsByUsername(@Param("username") String username);

    /**
     * 检查邮箱是否存在
     */
    @Select("SELECT COUNT(*) FROM t_user WHERE email = #{email} AND deleted = 0")
    boolean existsByEmail(@Param("email") String email);

    /**
     * 更新最后登录时间
     */
    @Update("UPDATE t_user SET last_login_at = #{loginTime}, updated_at = NOW() WHERE id = #{userId}")
    int updateLastLoginAt(@Param("userId") Long userId, @Param("loginTime") LocalDateTime loginTime);

    /**
     * 更新用户状态
     */
    @Update("UPDATE t_user SET is_active = #{isActive}, updated_at = NOW() WHERE id = #{userId}")
    int updateUserStatus(@Param("userId") Long userId, @Param("isActive") Boolean isActive);

    /**
     * 根据用户ID和密码哈希查找用户（用于密码验证）
     */
    @Select("SELECT * FROM t_user WHERE id = #{userId} AND password_hash = #{passwordHash} AND deleted = 0 AND is_active = 1")
    User findByIdAndPasswordHash(@Param("userId") Long userId, @Param("passwordHash") String passwordHash);
}