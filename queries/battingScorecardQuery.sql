SELECT P1.player_id as batsman_id, 
       P1.player_name as batsman_name, 
       P2.player_id as bowler_id, 
       P2.player_name as bowler_name, 
       P3.player_id as fielder_id, 
       P3.player_name as fielder_name, 
       B.runs_scored, B.balls_faced, 
       B.4s as fours, B.6s as sixes, 
       B.out_notout, B.out_by, B.out_by1,B.out_type,  
       B.team_position
FROM 
    BattingScorecard as B 
    natural join 
    Players as P1 
    inner join 
    Players as P2 ON (out_by = P2.player_id) 
    inner join  
    Players as P3 ON (out_by1 = P3.player_id) 
    WHERE B.match_id = ?
    AND 
    ? = (SELECT distinct team_id from MatchPlayerTeam 
        where player_id = P1.player_id and match_id = ?);