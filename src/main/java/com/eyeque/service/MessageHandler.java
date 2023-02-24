package com.eyeque.service;

import com.eyeque.controller.WebsocketServer;
import com.eyeque.model.Conversation;
import com.eyeque.model.Message;
import com.eyeque.model.MessageType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MessageHandler {

    private static ObjectMapper objectMapper;


    private static List<Conversation> conversationList;
    //key user id
    private static ConcurrentHashMap<Long, WebsocketServer> websocketServerConcurrentHashMap;

    @PostConstruct
    public void init() {
        objectMapper = new ObjectMapper();
        conversationList = Collections.synchronizedList(new ArrayList<Conversation>());
        websocketServerConcurrentHashMap = new ConcurrentHashMap();
    }


    public Conversation createConversation(long userId, long conversationId) {
        Conversation conversation = new Conversation();
        conversation.setConversationId(conversationId);
        conversation.setMemberLeft(userId);
        return conversation;
    }

    public Message createCommonMessage(MessageType messageType) {
        Message message = new Message<String>();
        message.setMessageId(messageType.getId().longValue());
        return message;
    }

    public Message convertMessage(String message) throws JsonProcessingException {
        return objectMapper.readValue(message, Message.class);
    }

    public String encodeMessage(Object message) throws JsonProcessingException {
        return objectMapper.writeValueAsString(message);
    }

    public Conversation convertConversation(String message) throws JsonProcessingException {
        return objectMapper.readValue(message, Conversation.class);
    }

    public Message sendUserId(long userId) {
        Message message = new Message<Long>(MessageType.MSG_CONNECTED);
        message.setBody(userId);
        return message;
    }

    public void saveSocket(Long userId, WebsocketServer websocketServer) {
        websocketServerConcurrentHashMap.put(userId, websocketServer);
    }

    public WebsocketServer getSocket(Long userId) {
        return websocketServerConcurrentHashMap.get(userId);
    }

    public void removeSocket(Long userId) {
        websocketServerConcurrentHashMap.remove(userId);
    }

    public void saveConversation(Conversation conversation) {
        //conversationHashMap.put()
        conversationList.add(conversation);
    }

    @Nullable
    public Conversation getConversation(Long conversationId) {
        int index = conversationList.indexOf(new Conversation(conversationId));
        return conversationList.get(index);
    }

    public Long queryLeftUserId(Long rightMember) {
        for (Conversation conversation : conversationList) {
            if (conversation.getMemberRight() == null) {
                continue;
            }
            if (conversation.getMemberRight().longValue() == rightMember) {
                return conversation.getMemberLeft();
            }
        }
        return null;
    }

    public void removeConversation(Long conversationId) {
        conversationList.remove(conversationId);
    }

}
