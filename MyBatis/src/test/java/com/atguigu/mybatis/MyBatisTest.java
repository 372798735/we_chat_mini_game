package com.atguigu.mybatis;

import com.atguigu.mybatis.entities.Tiger;
import com.atguigu.mybatis.mapper.TigerMapper;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

/**
 * MyBatis单元测试类
 * @SpringBootTest：启动 Spring 容器，自动扫描并注入 TigerMapper 代理对象
 */
@SpringBootTest
public class MyBatisTest {

    // 注入 TigerMapper（Spring Boot 自动创建的 MyBatis 代理对象）
    @Resource
    private TigerMapper tigerMapper;

    /**
     * 测试查询所有老虎信息
     */
    @Test
    public void testSelectTigerList() {
        // 调用Mapper方法执行SQL，查询所有老虎
        List<Tiger> tigerList = tigerMapper.selectTigerList();
        // 遍历输出结果
        for (Tiger tiger : tigerList) {
            System.out.println("老虎信息：" + tiger);
        }
    }
    /**
     * 可选：测试新增老虎（验证insert方法）
     */
    @Test
    public void testInsertTiger() {
        Tiger tiger = new Tiger();
        tiger.setTigerName("陈虎");
        tiger.setTigerAge(8);
        tiger.setTigerSalary(1000.0);
        // 调用新增方法，返回受影响行数
        int rows = tigerMapper.insertTiger(tiger);
        System.out.println("新增老虎受影响行数：" + rows); // 新增成功返回1
    }
}