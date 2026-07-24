package com.atguigu.mybatis.controller;

import com.atguigu.mybatis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.atguigu.mybatis.entities.SysUser;

@RestController
@RequestMapping("/api/users")
public class UserController {
  @Autowired
  private UserService userService; // 注入业务层

  @DeleteMapping("/{id}")
  public String deleteUser(@PathVariable Long id){
    boolean success = userService.deleteById(id);
    return  success ? "删除成功" : "删除失败（用户不存在）";
  }

  @PostMapping("/inser")
  public String addUser(@RequestBody SysUser user) {
    boolean success = userService.addUser(user);
    return success ? "新增成功" : "新增失败";
  }
}
