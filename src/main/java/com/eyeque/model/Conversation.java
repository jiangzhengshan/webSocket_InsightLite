package com.eyeque.model;

import java.util.Objects;

public class Conversation {

    private Long conversationId;
    private Long memberLeft;
    private Long memberRight;

    public Conversation() {
    }

    public Conversation(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getMemberLeft() {
        return memberLeft;
    }

    public void setMemberLeft(Long memberLeft) {
        this.memberLeft = memberLeft;
    }

    public Long getMemberRight() {
        return memberRight;
    }

    public void setMemberRight(Long memberRight) {
        this.memberRight = memberRight;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Conversation that = (Conversation) o;
        return Objects.equals(conversationId, that.conversationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(conversationId);
    }
}
