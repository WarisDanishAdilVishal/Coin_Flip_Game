package com.casino.coinflip;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoinFlipCasinoApplication {
    private static final Logger logger = LoggerFactory.getLogger(CoinFlipCasinoApplication.class);
    
    private final Environment environment;
    
    public CoinFlipCasinoApplication(Environment environment) {
        this.environment = environment;
    }
    
    public static void main(String[] args) {
        SpringApplication.run(CoinFlipCasinoApplication.class, args);
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void logEnvironmentDetails() {
        logger.info("Application started with the following configurations:");
        logger.info("Database URL: {}", environment.getProperty("spring.datasource.url"));
        logger.info("Database Username: {}", environment.getProperty("spring.datasource.username"));
        logger.info("JWT Expiration: {}", environment.getProperty("app.jwt.expiration"));
        logger.info("Frontend URL (CORS): {}", environment.getProperty("app.cors.allowed-origins"));
        logger.info("Server Port: {}", environment.getProperty("server.port"));
    }
}