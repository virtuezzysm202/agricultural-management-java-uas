package com.farmmanagement.middleware;

import static spark.Spark.before;
import static spark.Spark.halt;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class RateLimiterMiddleware {
    private static final int MAX_REQUESTS = 5;
    private static final long TIME_WINDOW_MS = TimeUnit.MINUTES.toMillis(1);

    private static final ConcurrentHashMap<String, RequestInfo> requests = new ConcurrentHashMap<>();

    public static void register() {
        before("/api/user/login", (req, res) -> {
            String ip = req.ip();
            long now = System.currentTimeMillis();

            requests.putIfAbsent(ip, new RequestInfo(0, now));
            RequestInfo info = requests.get(ip);

            if (now - info.startTime > TIME_WINDOW_MS) {
                info.startTime = now;
                info.count = 0;
            }

            if (info.count >= MAX_REQUESTS) {
                halt(429, "Too many requests. Try again later.");
            }

            info.count++;
        });
    }

    private static class RequestInfo {
        int count;
        long startTime;
        RequestInfo(int count, long startTime) {
            this.count = count;
            this.startTime = startTime;
        }
    }
}
