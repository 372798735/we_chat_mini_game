package com.atguigu.mybatis;

import com.atguigu.mybatis.entities.Employee;
import com.atguigu.mybatis.mapper.EmployeeMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmployeeMapperTest {
    @Autowired
    EmployeeMapper employeeMapper;

    @Test
    public void testSelectEmployee(){
        Employee employee = employeeMapper.selectEmployee(1);
        System.out.println("employee = " + employee);
    }

    @Test
    public void testInsertEmployee(){
        Employee employee = new Employee();
        employee.setEmpName("小张");
        employee.setEmpSalary(222222.00);
        int count = employeeMapper.insertEmployee(employee);
        System.out.println("count = " + count);
    }

    @Test
    public void testUpdateEmployee(){
        int count = employeeMapper.updateEmployee(1, 300.00);
        System.out.println("update-count = " + count);
    }

    @Test
    public  void  selectEmpCount(){
        int count = employeeMapper.selectEmpCount();
        System.out.println("获取的总数=" + count);
    }
}
