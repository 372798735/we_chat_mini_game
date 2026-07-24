package com.atguigu.mybatis;

import com.atguigu.mybatis.entities.Tiger;
import com.atguigu.mybatis.mapper.TigerMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.List;

@SpringBootTest
public class TigerMapperTest {

    @Autowired
    TigerMapper tigerMapper;

    @Test
    public void testSelectTigerByConfition() throws Exception{
        Tiger tiger = new Tiger();
        tiger.setTigerName("虎");
        tiger.setTigerSalary(500.00);
        List rows = tigerMapper.selectTigerByCondition(tiger);
        System.out.println("rows" +rows);
    }

    @Test
    public void testUpdateTigerDynamic() throws Exception{
        Tiger tiger = new Tiger();
        tiger.setTigerName("大老虎");
        tiger.setTigerSalary(300.00);
        tiger.setTigerId(1);
        int count = tigerMapper.updateTigerDynamic(tiger);
        System.out.println("总数" + count);
    }

    @Test
    public void testSelectTigerByConditionByTrim() throws Exception{
        Tiger tiger = new Tiger();
        tiger.setTigerName("赵虎");
        tiger.setTigerSalary(100.00);
        tiger.setTigerAge(3);
        List count = tigerMapper.selectTigerByConditionByTrim(tiger);
        System.out.println("总数查询" + count);
    }

    @Test
    public void testSelectTigerByConditionByChoose() throws Exception{
        Tiger tiger = new Tiger();
        tiger.setTigerName("赵虎");
        List count = tigerMapper.selectTigerByConditionByChoose(tiger);
        System.out.println("总数查询66" + count);
    }

//    @Test
//    public void testUpdateTigerBatch() throws  Exception{
//        Tiger tiger =  new Tiger();
//        tiger.setTigerId(1);
//        tiger.setTigerName("更新后的华南虎");
//        tiger.setTigerAge(10);
//
//        List<Tiger> updateList = Arrays.asList(tiger);
//
//        // 执行批量更新
//        int rows = tigerMapper.updateTigerBatch(updateList);
//        System.out.println("测试" + rows);
//        // 查询验证
//        Tiger updated1 = tigerMapper.selectTigerById(1);
//        System.out.println("更新后的数据" + updated1);
//    }

    @Test
    public void testSelectTiger() throws Exception{
        List<Tiger> tigerList = tigerMapper.selectTiger();
        System.out.println("tigerList 数据：" +tigerList);
    }
}
