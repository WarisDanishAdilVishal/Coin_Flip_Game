package com.casino.coinflip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoinFlipCasinoApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoinFlipCasinoApplication.class, args);
    }
}