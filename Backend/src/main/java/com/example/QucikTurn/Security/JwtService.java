package com.example.QucikTurn.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private final Key key; private final long expires;
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expires-in-seconds}") long exp){
        this.key = Keys.hmacShaKeyFor(secret.getBytes()); this.expires = exp;
    }
    public String generateToken(String subject, Map<String,Object> claims){
        Instant now = Instant.now();
        return Jwts.builder().setClaims(claims).setSubject(subject)
                .setIssuedAt(Date.from(now)).setExpiration(Date.from(now.plusSeconds(expires)))
                .signWith(key, SignatureAlgorithm.HS256).compact();
    }
    public String username(String token){
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }
    public boolean valid(String token, String username){
        try { return username.equals(username(token)) && Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)!=null; }
        catch (JwtException | IllegalArgumentException e){ return false; }
    }
    public long getExpires(){ return expires; }
}
