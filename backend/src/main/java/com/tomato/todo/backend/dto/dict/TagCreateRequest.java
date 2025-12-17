package com.tomato.todo.backend.dto.dict;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 标签创建请求DTO
 */
@Data
public class TagCreateRequest {

    @NotBlank(message = "标签名称不能为空")
    @Size(max = 20, message = "标签名称最多20个字符")
    private String name;

    private String color;
}