package com.atguigu.mybatis.service;
import com.atguigu.mybatis.entities.SysUser;
import com.atguigu.mybatis.mapper.SysUserMapper;
import  com.atguigu.mybatis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private SysUserMapper userMapper;

    // 新增用户
    public boolean addUser(SysUser user){
        return userMapper.insert(user);
    }

    public boolean deleteById(Long id){
        // 调用 Mapper 删除，返回影响行数 > 0 表示成功
        return userMapper.deleteById(id);
    }

    public boolean editUser(Long id, SysUser sysUser) {
        return userMapper.updateById(id, sysUser);
    }
}
