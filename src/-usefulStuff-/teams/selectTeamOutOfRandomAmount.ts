import random from "../../../../phaser-examples/src/games/-useful-stuff-/math/randomMinimumMaximum"

export default function selectTeam(amountOfTeams, teamObjects) {
    let newTeamName = ""
    const teams = []
    for (let x = 0; x < amountOfTeams; x++) {
        const team = {
            teamName: null,
            teamScore: null,
            teamPlayerAmount: 0,
        }

        team.teamName = teamObjects[x].name
        team.teamScore = teamObjects[x].score
        team.teamPlayerAmount = teamObjects[x].team.players

        teams.push(team)
    }

    let lowestScore = 0
    const equalScoreTeams = []

    for (const team of teams) {
        if (lowestScore > team.score) {
            lowestScore = team.score
            newTeamName = team.teamName
        }

        if (lowestScore == team.score) {
            equalScoreTeams.push(team)
        }
    }

    let leastPlayers = 21
    const equalAmountPlayersTeams = []

    if (equalScoreTeams.length > 1) {
        for (const team of equalScoreTeams) {
            if (leastPlayers > team.teamPlayerAmount) {
                leastPlayers = team.teamPlayerAmount
                newTeamName = team.teamName
            }

            if (leastPlayers == team.teamPlayerAmount) {
                equalAmountPlayersTeams.push(team)
            }

        }
    }

    if (equalAmountPlayersTeams.length > 1) {
        newTeamName = equalAmountPlayersTeams[random(0, equalAmountPlayersTeams.length - 1)].teamName
    }


    return newTeamName
}