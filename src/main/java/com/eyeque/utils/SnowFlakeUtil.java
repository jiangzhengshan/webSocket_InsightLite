package com.eyeque.utils;

import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * @ClassName: SnowFlakeUtil
 * @Author: jiaoxian
 * @Date: 2022/4/24 16:34
 * @Description:
 */
@Component
public class SnowFlakeUtil {

    private static SnowFlakeUtil snowFlakeUtil = new SnowFlakeUtil();


    // 初始时间戳(纪年)，可用雪花算法服务上线时间戳的值
    // 1650789964886：2022-04-24 16:45:59
    private static final long INIT_EPOCH = 1650789964886L;

    // 时间位取&
    private static final long TIME_BIT = 0b1111111111111111111111111111111111111111110000000000000000000000L;

    // 记录最后使用的毫秒时间戳，主要用于判断是否同一毫秒，以及用于服务器时钟回拨判断
    private long lastTimeMillis = -1L;

    // dataCenterId占用的位数
    private static final long DATA_CENTER_ID_BITS = 5L;

    // dataCenterId占用5个比特位，最大值31
    // 0000000000000000000000000000000000000000000000000000000000011111
    private static final long MAX_DATA_CENTER_ID = ~(-1L << DATA_CENTER_ID_BITS);

    // dataCenterId
    private long dataCenterId;

    // workId占用的位数
    private static final long WORKER_ID_BITS = 5L;

    // workId占用5个比特位，最大值31
    // 0000000000000000000000000000000000000000000000000000000000011111
    private static final long MAX_WORKER_ID = ~(-1L << WORKER_ID_BITS);

    // workId
    private long workerId;

    // 最后12位，代表每毫秒内可产生最大序列号，即 2^12 - 1 = 4095
    private static final long SEQUENCE_BITS = 12L;

    // 掩码（最低12位为1，高位都为0），主要用于与自增后的序列号进行位与，如果值为0，则代表自增后的序列号超过了4095
    // 0000000000000000000000000000000000000000000000000000111111111111
    private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);

    // 同一毫秒内的最新序号，最大值可为 2^12 - 1 = 4095
    private long sequence;

    // workId位需要左移的位数 12
    private static final long WORK_ID_SHIFT = SEQUENCE_BITS;

    // dataCenterId位需要左移的位数 12+5
    private static final long DATA_CENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;

    // 时间戳需要左移的位数 12+5+5
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATA_CENTER_ID_BITS;

    /**
     * 无参构造
     */
    public SnowFlakeUtil() {
        this(1, 1);
    }

    /**
     * 有参构造
     *
     * @param dataCenterId
     * @param workerId
     */
    public SnowFlakeUtil(long dataCenterId, long workerId) {
        // 检查dataCenterId的合法值
        if (dataCenterId < 0 || dataCenterId > MAX_DATA_CENTER_ID) {
            throw new IllegalArgumentException(
                    String.format("dataCenterId 值必须大于 0 并且小于 %d", MAX_DATA_CENTER_ID));
        }
        // 检查workId的合法值
        if (workerId < 0 || workerId > MAX_WORKER_ID) {
            throw new IllegalArgumentException(String.format("workId 值必须大于 0 并且小于 %d", MAX_WORKER_ID));
        }
        this.workerId = workerId;
        this.dataCenterId = dataCenterId;
    }

    public static Long getSnowFlakeId() {
        return snowFlakeUtil.nextId();
    }

    public synchronized long nextId() {
        long currentTimeMillis = System.currentTimeMillis();
        System.out.println(currentTimeMillis);
        if (currentTimeMillis < lastTimeMillis) {
            throw new RuntimeException(
                    String.format("可能出现服务器时钟回拨问题，请检查服务器时间。当前服务器时间戳：%d，上一次使用时间戳：%d", currentTimeMillis,
                            lastTimeMillis));
        }
        if (currentTimeMillis == lastTimeMillis) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            if (sequence == 0) {
                currentTimeMillis = getNextMillis(lastTimeMillis);
            }
        } else {
            sequence = 0;
        }
        lastTimeMillis = currentTimeMillis;
        return
                // 时间戳部分
                ((currentTimeMillis - INIT_EPOCH) << TIMESTAMP_SHIFT)
                        // 数据中心部分
                        | (dataCenterId << DATA_CENTER_ID_SHIFT)
                        // 机器表示部分
                        | (workerId << WORK_ID_SHIFT)
                        // 序列号部分
                        | sequence;
    }

    private long getNextMillis(long lastTimeMillis) {
        long currentTimeMillis = System.currentTimeMillis();
        while (currentTimeMillis <= lastTimeMillis) {
            currentTimeMillis = System.currentTimeMillis();
        }
        return currentTimeMillis;
    }

    public static String getRandomStr() {
        return Long.toString(getSnowFlakeId(), Character.MAX_RADIX);
    }

    public static Date getTimeBySnowFlakeId(long id) {
        return new Date(((TIME_BIT & id) >> 22) + INIT_EPOCH);
    }

    public static void main(String[] args) {
        SnowFlakeUtil snowFlakeUtil = new SnowFlakeUtil();
        long id = snowFlakeUtil.nextId();
        System.out.println(id);
        Date date = SnowFlakeUtil.getTimeBySnowFlakeId(id);
        System.out.println(date);
        long time = date.getTime();
        System.out.println(time);
        System.out.println(getRandomStr());

    }

}