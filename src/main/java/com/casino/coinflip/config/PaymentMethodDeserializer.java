package com.casino.coinflip.config;

import com.casino.coinflip.entity.WithdrawalRequest.PaymentMethod;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

public class PaymentMethodDeserializer extends JsonDeserializer<PaymentMethod> {
    @Override
    public PaymentMethod deserialize(JsonParser p, DeserializationContext ctxt) 
            throws IOException, JsonProcessingException {
        String value = p.getValueAsString();
        if (value == null) {
            return null;
        }
        try {
            return PaymentMethod.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IOException("Invalid payment method: " + value, e);
        }
    }
} 