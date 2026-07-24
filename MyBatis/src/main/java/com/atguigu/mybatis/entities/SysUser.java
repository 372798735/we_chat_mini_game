package com.atguigu.mybatis.entities;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SysUser {
    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码 (BCrypt加密)
     */
    private String password;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 用户头像URL
     */
    private String avatar;

    /**
     * 状态 (0-禁用, 1-启用 等)
     */
    private Integer status;

    /**
     * 角色ID (关联)
     */
    private Long roleId;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
