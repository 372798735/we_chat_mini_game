package com.atguigu.mybatis.service;
import com.atguigu.mybatis.entities.SysUser;
import com.atguigu.mybatis.mapper.SysUserMapper;

public interface UserService {
    // 定义删除方法
    boolean deleteById(Long id);

    // 新增用户
    boolean addUser(SysUser sysUser);

    // 根据ID更新用户
    boolean editUser(Long id, SysUser sysUser);
}
