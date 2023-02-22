package com.eyeque.controller;

import com.eyeque.service.MessageHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

@Controller
public class MainController {

    @Autowired
    MessageHandler messageHandler;


}
