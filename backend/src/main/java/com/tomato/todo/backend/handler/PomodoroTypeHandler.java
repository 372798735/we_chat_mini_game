package com.tomato.todo.backend.handler;

import com.tomato.todo.backend.entity.Pomodoro;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * 番茄钟类型处理器
 * 处理数据库中存储的小写枚举值和Java中大写枚举值的转换
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@MappedTypes(Pomodoro.PomodoroType.class)
public class PomodoroTypeHandler extends BaseTypeHandler<Pomodoro.PomodoroType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Pomodoro.PomodoroType parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name().toLowerCase());
    }

    @Override
    public Pomodoro.PomodoroType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return convert(value);
    }

    @Override
    public Pomodoro.PomodoroType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return convert(value);
    }

    @Override
    public Pomodoro.PomodoroType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return convert(value);
    }

    private Pomodoro.PomodoroType convert(String value) {
        if (value == null) {
            return null;
        }

        switch (value.toLowerCase()) {
            case "work":
                return Pomodoro.PomodoroType.WORK;
            case "short_break":
                return Pomodoro.PomodoroType.SHORT_BREAK;
            case "long_break":
                return Pomodoro.PomodoroType.LONG_BREAK;
            default:
                throw new IllegalArgumentException("Unknown PomodoroType value: " + value);
        }
    }
}