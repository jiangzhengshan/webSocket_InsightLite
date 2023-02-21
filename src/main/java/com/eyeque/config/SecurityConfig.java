package com.eyeque.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * @author jiangzhengshan
 */
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    @Autowired
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        /*auth.inMemoryAuthentication()
                .withUser("javaboy")
                .password("{noop}123")
                .roles("admin")
                .and()
                .withUser("江南一点雨")
                .password("{noop}123")
                .roles("admin");*/
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .anyRequest().permitAll();
    }
}
