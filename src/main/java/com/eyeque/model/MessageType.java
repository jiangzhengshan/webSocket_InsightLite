package com.eyeque.model;

public enum MessageType {

    MSG_CONNECTED(0x10000),
    MSG_CREATE_CONVERSION(0x00020),
    MSG_END_CONVERSION(0x00021),
    MSG_PAIR_CONVERSION(0x00022),
    MSG_MESSAGE(0X0023),


    MSG_ERROR_RESPONSE(0x00010),
    MSG_RESPONSE_OK(0x000011),


    MES_UNKNOWN(0x00000),
    ;

    private Integer id;

    MessageType(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public static MessageType transfer(Integer id) {
        for (MessageType type : values()) {
            if (type.id.intValue() == id.intValue()) {
                return type;
            }
        }
        return MES_UNKNOWN;
    }
}
