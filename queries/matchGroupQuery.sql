WITH M1 as  
    (SELECT series_id, series_name, series_type, 
       M.date, authority, ST.country as host_country, 
       M.match_id 
FROM 
    Series as S 
    natural join Matches as M 
    natural join MatchPlayerTeam as MPT 
    natural join Stadiums as ST
WHERE 
    M.date >= '2001-01-01' 
    and M.date <= '2024-01-01' 
    and (-1 < 0 OR MPT.team_id = -1) 
    and (-1 < 0 OR ST.country = -1) 
    and EXISTS (SELECT * FROM MatchPlayerTeam as MPT natural join Teams as T2
        WHERE (-1 < 0 OR T2.team_id = -1) 
            and MPT.match_id = M.match_id))
, 
T1 as 
    (SELECT MAX(MPT.team_id) as team1_id, MIN(MPT.team_id) as team2_id, 
    MPT.match_id 
    FROM M1 inner join MatchPlayerTeam as MPT ON (M1.match_id = MPT.match_id)
    GROUP BY MPT.match_id)
,
TEAMS1 as 
    (SELECT T1.team1_id as team1_id, TE1.team_name as team1_name, 
        T1.team2_id as team2_id, TE2.team_name as team2_name, 
        T1.match_id 
        FROM T1 inner join Teams as TE1 ON(TE1.team_id = T1.team1_id) 
        inner join Teams as TE2 ON(TE2.team_id = T1.team2_id))

SELECT distinct M1.series_id, M1.series_name, M1.series_type, 
    M1.date, M1.authority, M1.host_country, M1.match_id, 
    TEAMS1.team1_id, TEAMS1.team1_name, TEAMS1.team2_id, TEAMS1.team2_name
FROM 
    M1 natural join T1 inner join TEAMS1 ON (T1.match_id = TEAMS1.match_id)