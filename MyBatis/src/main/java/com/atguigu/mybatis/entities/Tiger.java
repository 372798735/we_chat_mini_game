package com.atguigu.mybatis.entities;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 老虎实体类：对应数据库t_tiger表
 * @Data：Lombok注解，自动生成getter、setter、toString、equals/hashCode等方法
 * 核心规则：数据库下划线命名（tiger_id）→ Java驼峰命名（tigerId），MyBatis默认支持该映射
 */
@Data
@TableName("t_tiger") // 核心修改：指定数据库表名为t_tiger
public class Tiger {

    // 核心修改：主键字段匹配t_tiger表的tiger_id，类型为Integer（表是INT类型）
    @TableId(value = "tiger_id", type = IdType.AUTO)
    private Integer tigerId;

    // 核心修改：匹配表的tiger_name字段
    @TableField("tiger_name")
    private String tigerName;

    // 核心修改：匹配表的tiger_age字段
    @TableField("tiger_age")
    private Integer tigerAge;

    // 核心修改：匹配表的tiger_salary字段（DOUBLE类型）
    @TableField("tiger_salary")
    private Double tigerSalary;
}
