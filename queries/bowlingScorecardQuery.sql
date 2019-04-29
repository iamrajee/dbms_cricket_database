SELECT 
    player_id, player_name, runs_given, maidens, overs_bowled, balls_bowled, 
    getWicketsTaken(match_id, player_id) as wicketsTaken
FROM 
    BowlingScorecard natural join MatchPlayerTeam natural join Players
WHERE
    team_id = ? and match_id = ?