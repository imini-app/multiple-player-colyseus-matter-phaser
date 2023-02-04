import random from "../../../../phaser-examples/src/games/-useful-stuff-/math/randomMinimumMaximum";

export default function selectTeam(teamOneScore, teamTwoScore, teamOne, teamTwo, teamOneName, teamTwoName) {
    let team = ""
    if (teamOneScore < teamTwoScore) {
        team = teamOneName
    } else if (teamTwoScore < teamOneScore) {
        team = teamTwoName
    } else if (teamOneScore == teamTwoScore) {
        const teamOnePlayers = teamOne.players
        const teamTwoPlayers = teamTwo.players
        if (teamOnePlayers < teamTwoPlayers) {
            team = teamOneName
        } else if (teamTwoPlayers < teamOnePlayers) {
            team = teamTwoName
        } else if (teamOnePlayers == teamTwoPlayers) {
            const randomNumber = random(1, 2)
            if (randomNumber == 1) {
                team = teamOneName
            } else if (randomNumber == 2) {
                team = teamTwoName
            }
        }
    }

    return team
}