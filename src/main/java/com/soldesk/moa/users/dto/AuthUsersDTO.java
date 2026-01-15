package com.soldesk.moa.users.dto;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Setter
@Getter
public class AuthUsersDTO extends User {

    private UsersDTO usersDTO;

    public AuthUsersDTO(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
    }

    public AuthUsersDTO(UsersDTO usersDTO) {
        super(usersDTO.getEmail(), usersDTO.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usersDTO.getUserRole())));
        this.usersDTO = usersDTO;
    }
}
