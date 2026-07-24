package com.atguigu;

class TestThread extends Thread {
   @Override
   public void run(){
       for(int i = 0; i < 5; i++){
          try{
              Thread.sleep(2000L);
          }catch(InterruptedException e){
              e.printStackTrace();
          }
          System.out.println(Thread.currentThread().getName()  + ":MyThread正在执行..." + i);
       }
   }
}

public class Main2 extends Thread {
    public static void main(String[] args) throws InterruptedException {
        // 创建自定义线程对象
        TestThread t1 = new TestThread();

        // 设置线程名称
        t1.setName("广坤");

        // 调用start方法开启线程，jvm自动执行run方法
        t1.start();

        for(int i = 0; i < 5; i++){
            Thread.sleep(2000L);
            System.out.println(Thread.currentThread().getName()+":Main正在执行......"+ i);
        }
    }
}