package com.atguigu.mybatis.mapper;

import com.atguigu.mybatis.entities.Employee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper  // 声明接口代理对象
public interface EmployeeMapper {
   Employee selectEmployee(Integer empId);

   int insertEmployee(Employee employee);

   // 更新
   int updateEmployee(@Param("empId") Integer empId, @Param("empSalary") Double empSalary);

   // 返回总数
   int selectEmpCount();
}
