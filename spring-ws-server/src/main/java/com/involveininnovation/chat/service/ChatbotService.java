package com.involveininnovation.chat.service;

import org.springframework.stereotype.Service;

import com.involveininnovation.chat.model.Message;

@Service
public class ChatbotService {

    public Message generateBotResponse(Message message) {
        String userMessage = message.getMessage();
        String botResponse;

        // Simple bot logic - you can expand this with more complex logic
        if (userMessage.contains("hello")) {
            botResponse = "Hello! How can I assist you today?";
        } else if (userMessage.contains("help")) {
            botResponse = "Sure, I'm here to help. What do you need assistance with?";
        } else {
            botResponse = "I'm not sure how to respond to that, but I'm here to help!";
        }

        // Create a new Message object for the bot's response
        Message botMessage = new Message();
        botMessage.setSenderName("chatbot");
        botMessage.setReceiverName(message.getSenderName());
        botMessage.setMessage(botResponse);

        return botMessage;
    }
    
    public Message generateInitialBotResponse(String receiverName) {
        // Generate the initial message from the bot
    	
    	
    	// Create a new Message object for the bot's response
        Message botMessage = new Message();
        botMessage.setSenderName("chatbot");
        botMessage.setReceiverName(receiverName);
        botMessage.setMessage("Hello! How can I assist you today?");
        
        return botMessage;
     
    }
}
