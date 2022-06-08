let anExampleObject = {
    name: 'Xwill',
    score: 10,
}

let playerArray = [
    {
        name: 'X',
        size: 50,
    },
    {
        name: 'X2',
        size: 26
    },
    {
        name: 'X3',
        size: 47
    },
    {
        name: 'X3',
        size: 47
    },
    {
        name: 'X3',
        size: 100
    },
    {
        name: 'X3',
        size: 26
    },
    {
        name: 'X3',
        size: 77
    },
    {
        name: 'X3',
        size: 34
    },



]

console.log('players', playerArray)
console.log('playerlength', playerArray.length)
console.log('player3', playerArray[2].name)
console.log('player2', playerArray[1]['name'])

function sortArray(array) {
    array.sort((a, b) => b.size - a.size)
    return array
}

let answer = sortArray(playerArray)
console.log('answer', answer)