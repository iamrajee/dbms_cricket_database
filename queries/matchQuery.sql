 WITH T AS (SELECT * FROM Matches WHERE match_id = ?),  
 T1 as 
    (SELECT MAX(MPT.team_id) as team1_id, MIN(MPT.team_id) as team2_id 
    FROM T inner join MatchPlayerTeam as MPT ON (T.match_id =MPT.match_id)), 
 
TEAMS as 
    (SELECT T1.team1_id as team1_id, TE1.team_name as team1_name, 
        T1.team2_id as team2_id, TE2.team_name as team2_name 
        FROM T1 inner join Teams as TE1 ON(TE1.team_id = T1.team1_id) 
        inner join Teams as TE2 ON(TE2.team_id = T1.team2_id)),  
        
M1 AS 
    (SELECT T.match_id, T.match_type, T.date, T.toss, SE.series_id, 
        SE.series_name, ST.stadium_id, ST.stadium_name  
        FROM T inner join Stadiums as ST ON (T.stadium_id = ST.stadium_id) 
        inner join Series as SE ON (T.series_id = SE.series_id)), 
        
U1 as 
    (SELECT * FROM T inner join Umpires ON (T.umpire1_id = Umpires.umpire_id)),  
U2 as 
    (SELECT * FROM T inner join Umpires ON (T.umpire2_id = Umpires.umpire_id)), 
U3 as 
    (SELECT * FROM T inner join Umpires ON (T.thirdumpire_id = Umpires.umpire_id)),  
UMPIRES AS 
    (SELECT U1.umpire_id as umpire1_id, U1.umpire_name as umpire1_name, 
        U2.umpire_id as umpire2_id, U2.umpire_name as umpire2_name, 
        U3.umpire_id as thirdumpire_id, U3.umpire_name as thirdumpire_name   
        FROM U1, U2, U3) 
SELECT M1.match_id, M1.match_type, M1.date, M1.toss, M1.series_id,
     M1.series_name, M1.stadium_id, M1.stadium_name,  TEAMS.team1_id, 
     TEAMS.team1_name, TEAMS.team2_id, TEAMS.team2_name, UMPIRES.umpire1_id, 
     UMPIRES.umpire1_name, UMPIRES.umpire2_id,  UMPIRES.umpire2_name, 
     UMPIRES.thirdumpire_id, UMPIRES.thirdumpire_name FROM TEAMS, UMPIRES, M1;
