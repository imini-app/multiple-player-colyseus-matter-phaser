function calculateAddition(number1, number2) {
    let answer = number1 + number2
    return answer
}

function calculateSubtraction(number1, number2) {
    let answer = number1 - number2
    return answer
}

function calculateMultiplication(number1, number2) {
    let answer = number1 * number2
    return answer
}

function calculateDivision(number1, number2) {
    let answer = number1 / number2
    return answer
}

function calculateAdditionAndMultiplication(number1, number2, number3) {
    let additionCalculation = calculateAddition(number1, number2)
    let answer = calculateMultiplication(additionCalculation, number3)
    return answer
}

function calculateEquation(baseNumber, numbers, equation) {
    let currentAnswer = baseNumber
    for (let number of numbers) {
        currentAnswer = eval(`${currentAnswer} ${equation} ${number}`)
    }
    return currentAnswer
}
