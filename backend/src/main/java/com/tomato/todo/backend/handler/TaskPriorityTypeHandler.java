package com.tomato.todo.backend.handler;

import com.tomato.todo.backend.entity.Task;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * 任务优先级枚举类型处理器
 * 处理数据库字符串与Priority枚举的转换
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@MappedTypes(Task.Priority.class)
public class TaskPriorityTypeHandler extends BaseTypeHandler<Task.Priority> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Task.Priority parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.getValue());
    }

    @Override
    public Task.Priority getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : Task.Priority.fromValue(value);
    }

    @Override
    public Task.Priority getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : Task.Priority.fromValue(value);
    }

    @Override
    public Task.Priority getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : Task.Priority.fromValue(value);
    }
}