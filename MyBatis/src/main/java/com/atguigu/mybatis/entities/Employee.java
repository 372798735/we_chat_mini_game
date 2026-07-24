package com.atguigu.mybatis.entities;

import lombok.Data;

@Data
public class Employee {
    private Long empId;
    private String empName;
    private Double empSalary;
}