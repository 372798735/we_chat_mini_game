package com.atguigu.mybatis;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class AOPTest {
    
    @Autowired
    private Calculator calculator;
    
    @Test
    public void testAnnotationAOP() {
        int add = calculator.add(10, 2);
        System.out.println("方法外部 add = " + add);
    
    }
    
}