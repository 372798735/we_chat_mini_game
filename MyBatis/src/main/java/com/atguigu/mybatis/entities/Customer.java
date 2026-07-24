package com.atguigu.mybatis.entities;
import com.atguigu.mybatis.entities.Order;

import lombok.Data;

import java.util.List;

@Data
public class Customer {    
    private Integer customerId;
    private String customerName;
    private List<Order> orderList;// 体现的是对多的关系
}