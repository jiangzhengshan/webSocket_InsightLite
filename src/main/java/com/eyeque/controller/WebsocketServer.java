package com.eyeque.controller;

import com.eyeque.Constant;
import com.eyeque.model.Conversation;
import com.eyeque.model.Message;
import com.eyeque.model.MessageType;
import com.eyeque.service.MessageHandler;
import com.eyeque.utils.SnowFlakeUtil;
import com.eyeque.utils.SpringCtxUtils;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;

@Component
@ServerEndpoint("/websocket")
public class WebsocketServer {


    private MessageHandler messageHandler;

    private void initMessageHandler() {
        messageHandler = SpringCtxUtils.getBean(MessageHandler.class);
    }

    private Session session;
    private Long userId;
    private Long conversationId;

    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        //send user Id
        this.userId = SnowFlakeUtil.getSnowFlakeId();
        initMessageHandler();
        try {
            sendMessage(messageHandler.sendUserId(this.userId));
            //save websocket
            messageHandler.saveSocket(this.userId, this);
        } catch (Exception e) {
            try {
                session.getBasicRemote().sendObject(messageHandler.createCommonMessage(MessageType.MSG_ERROR_RESPONSE,this.userId));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
        }
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        //logger.info("连接关闭！");
        messageHandler.removeSocket(this.userId);
        messageHandler.removeConversation(this.conversationId);
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        try {
            if (message.isEmpty() || message.length() < 5) {
                //sendMessage(messageHandler.createCommonMessage(MessageType.MSG_RESPONSE_OK,this.userId));
                return;
            }
            Message messageResult = messageHandler.convertMessage(message);
            MessageType messageType = MessageType.transfer(messageResult.getMessageId().intValue());
            switch (messageType) {
                case MSG_CREATE_CONVERSION:
                    Conversation conversation = messageHandler.createConversation(this.userId, SnowFlakeUtil.getSnowFlakeId());
                    this.conversationId = conversation.getConversationId();
                    sendMessage(conversation);
                    //save conversation
                    messageHandler.saveConversation(conversation);
                    break;
                case MSG_END_CONVERSION:
                    break;
                case MSG_PAIR_CONVERSION:
                    //send left
                    Map<String, Long> body = (Map<String, Long>) messageResult.getBody();
                    Long conversationId = body.get("conversationId");
                    Long memberLeft = body.get("memberLeft");
                    if (conversationId == null || conversationId == 0) {
                        sendMessage(messageHandler.createCommonMessage(MessageType.MSG_ERROR_RESPONSE,this.userId));
                        return;
                    }
                    //send msg
                    messageHandler.getSocket(memberLeft).sendMessage(messageHandler.createCommonMessage(MessageType.MSG_PAIR_SUCCESS,this.userId));

                    //response right
                    sendMessage(messageHandler.createCommonMessage(MessageType.MSG_RESPONSE_OK,this.userId));

                    //update conversation
                    messageHandler.getConversation(conversationId).setMemberRight(this.userId);
                    break;
                case MSG_MESSAGE:
                    Long leftId = messageHandler.queryLeftUserId(this.userId);
                    if (leftId == null || leftId == 0) {
                        sendMessage(messageHandler.createCommonMessage(MessageType.MSG_ERROR_RESPONSE,this.userId));
                        return;
                    }

                    messageHandler.getSocket(leftId).sendMessage(message);

                    //response right
                    sendMessage(messageHandler.createCommonMessage(MessageType.MSG_RESPONSE_OK,this.userId));
                    break;
                case MSG_TESTDOWN:
                    Long rightId = messageHandler.queryLeftUserId(this.userId);
                    if (rightId == null || rightId == 0) {
                        sendMessage(messageHandler.createCommonMessage(MessageType.MSG_ERROR_RESPONSE,this.userId));
                        return;
                    }
                    //send end message
                    messageHandler.getSocket(rightId).sendMessage(message);
                    break;
                case MES_UNKNOWN:
                    break;
            }
        } catch (Exception e) {
            try {
                session.getBasicRemote().sendObject(messageHandler.createCommonMessage(MessageType.MSG_ERROR_RESPONSE,this.userId));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
        }
    }

    /**
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        //logger.error("发生错误");
        error.printStackTrace();
    }


    /**
     * 向客户端发送消息
     */
    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }

    public void sendMessage(Object message) throws IOException {
        String data = messageHandler.encodeMessage(message);
        System.out.println("" + data);
        this.session.getBasicRemote().sendText(data);
    }

   /* public void sendMessageByUserId(String userId, String message) throws IOException {

        if (StringUtils.isNotBlank(userId) && webSocketMap.containsKey(userId)) {
            webSocketMap.get(userId).sendMessage(message);
        } else {
            logger.error("用户{}不在线", userId);
        }

    }
    public void sendMessageByUserId(String userId, Object message) throws IOException, EncodeException {
        logger.info("服务端发送消息到{},消息：{}", userId, message);
        if (StringUtils.isNotBlank(userId) && webSocketMap.containsKey(userId)) {
            webSocketMap.get(userId).sendMessage(message);
        } else {
            logger.error("用户{}不在线", userId);
        }
    }*/


}
