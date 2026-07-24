package com.atguigu.mybatis.mapper;
import com.atguigu.mybatis.entities.SysUser;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysUserMapper {
    /**
     * 根据ID删除用户
    */
    boolean deleteById(Long id);
    /**
     *  根据ID更新用户（动态更新非空字段）
     */

    /**
     * 新增用户
    */
    boolean insert(SysUser sysUser);

    /**
     *  根据ID查询用户
    */
    boolean updateById(@Param("id") Long id, @Param("sysUser") SysUser sysUser);

    /**
     * 根据ID查询用户
     */
    SysUser getById(Long id);

    /**
     *  条件查询用户列表
     */
    List<SysUser> list(@Param("username") String username, @Param("phone") String phone, @Param("status") Integer status);

    /**
     * 登录校验
     */
    boolean login(@Param("username") String username, @Param("password") String password);

}
