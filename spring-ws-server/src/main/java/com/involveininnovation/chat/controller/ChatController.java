package com.involveininnovation.chat.controller;

import com.involveininnovation.chat.model.Message;
import com.involveininnovation.chat.service.ChatbotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private ChatbotService chatbotService;
    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    public Message receiveMessage(@Payload Message message){
  
        return message;
    }
    @MessageMapping("/private-message")
    public Message recMessage(@Payload Message message){
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/private",message);
        System.out.println(message.toString());
     	 Message botResponse = chatbotService.generateBotResponse(message);
         simpMessagingTemplate.convertAndSendToUser(botResponse.getReceiverName(), "/private", botResponse);
        return message;
    }
    
    @MessageMapping("/user-join")
    public void userJoin(@Payload Message message) {
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(), "/private", message);
        Message botResponse = chatbotService.generateInitialBotResponse(message.getSenderName());
        simpMessagingTemplate.convertAndSendToUser(botResponse.getReceiverName(), "/private", botResponse);
    }
}
