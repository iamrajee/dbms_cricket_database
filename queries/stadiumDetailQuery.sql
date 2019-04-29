select 
    capacity, stadium_name, country_name, 
    getTotalMatchOnStadium(?, '%') as matchesPlayed, 
    getTotalMatchOnStadium(?, 'T20') as t20MatchesPlayed, 
    getTotalMatchOnStadium(?, 'ODI') as odiMatchesPlayed, 
    getTotalMatchOnStadium(?, 'Test') as testMatchesPlayed 
from 
    Stadiums natural join Countries where stadium_id = ?
LIMIT 1