package com.atguigu.mybatis.mapper;

import com.atguigu.mybatis.entities.Order;

public interface OrderMapper {
    Order selectOrderWithCustomer(Integer orderId);
}