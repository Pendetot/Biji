// Demo file untuk testing AI Code Assistant
function calculateFibonacci(n) {
    if (n <= 1) return n;
    return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

function processUserData(userData) {
    // Potential bug: no input validation
    const result = {
        name: userData.name.toUpperCase(),
        age: userData.age * 2,
        email: userData.email
    };
    
    return result;
}

// Inefficient code that could be optimized
function findDuplicates(arr) {
    const duplicates = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
                duplicates.push(arr[i]);
            }
        }
    }
    return duplicates;
}

module.exports = {
    calculateFibonacci,
    processUserData,
    findDuplicates
};