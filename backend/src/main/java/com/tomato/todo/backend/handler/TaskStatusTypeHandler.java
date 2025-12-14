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
 * 任务状态枚举类型处理器
 * 处理数据库字符串与TaskStatus枚举的转换
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@MappedTypes(Task.TaskStatus.class)
public class TaskStatusTypeHandler extends BaseTypeHandler<Task.TaskStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Task.TaskStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.getValue());
    }

    @Override
    public Task.TaskStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : Task.TaskStatus.fromValue(value);
    }

    @Override
    public Task.TaskStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : Task.TaskStatus.fromValue(value);
    }

    @Override
    public Task.TaskStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : Task.TaskStatus.fromValue(value);
    }
}