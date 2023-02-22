package com.eyeque.model;

/**
 * @author jiangzhengshan
 */
public class Message<T> {
    private Long messageId;
    private T body;

    public Message() {

    }

    public Message(MessageType messageType) {
        this.messageId = messageType.getId().longValue();
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public T getBody() {
        return body;
    }

    public void setBody(T body) {
        this.body = body;
    }
}
