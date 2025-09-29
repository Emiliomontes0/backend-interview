const net = require('net');
const readline = require('readline');

// Function to create a string with beginning forward and end backwards
function createForwardBackwardString(input) {
    const length = input.length;
    const mid = Math.floor(length / 2);
    
    let result = '';
    

    for (let i = 0; i < mid; i++) {
        result += input[i];
    }
 

    for (let i = length - 1; i >= mid; i--) {
        result += input[i];
    }
    
    return result;
}

// Function to transform a => e and every second e => a
function transformAtoE(string) {
    let eCount = 0;
    let result = '';
    
    for (let char of string) {
        if (char === 'a') {
            result += 'e';
        } else if (char === 'e') {
            eCount++;
            if (eCount % 2 === 0) {
                result += 'a'; 
            } else {
                result += 'e'; 
            }
        } else {
            result += char;
        }
    }
    
    return result;
}

// Function to apply ROT13 cipher
function applyRot13(string) {
    return string.replace(/[a-z]/g, function(char) {
        const code = char.charCodeAt(0);
        const rotated = ((code - 97 + 13) % 26) + 97;
        return String.fromCharCode(rotated);
    });
}

// Function to generate text histogram
function generateHistogram(string) {
    const freq = {};
    for (let char of string.toLowerCase()) {
        if (char >= 'a' && char <= 'z') {
            freq[char] = (freq[char] || 0) + 1;
        }
    }
    
    const maxFreq = Math.max(...Object.values(freq));
    
    // Create histogram
    let histogram = '';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    
    // Generate histogram lines (from top to bottom)
    for (let level = maxFreq; level > 0; level--) {
        let line = '';
        for (let letter of alphabet) {
            if (freq[letter] >= level) {
                line += '*';
            } else {
                line += ' ';
            }
        }
        histogram += line + '\n';
    }
    
    // Add alphabet line
    histogram += alphabet + '\n';
    
    return histogram;
}

// Function to process input and return result
function processInput(input) {
    // Validate input (lowercase ASCII letters only)
    if (!/^[a-z]+$/.test(input)) {
        return 'Error: Input must contain only lowercase ASCII letters';
    }
    
    try {
        const forwardBackward = createForwardBackwardString(input);
        
        const transformed = transformAtoE(forwardBackward);
        
        const rot13 = applyRot13(transformed);
        
        const histogram = generateHistogram(rot13);
        
        return `Histogram:\n${histogram}\nFinal string: ${rot13}`;
        
    } catch (error) {
        return `Error processing input: ${error.message}`;
    }
}


// Create server
const server = net.createServer((socket) => {
    console.log('Client connected');
    
    let data = '';
    
    socket.on('data', (chunk) => {
        data += chunk.toString();
        
        if (data.includes('\n')) {
            const input = data.trim();
            console.log('Received input:', input);
            
            const result = processInput(input);
            socket.write(result + '\n');
            socket.end();
        }
    });
    
    socket.on('end', () => {
        console.log('Client disconnected');
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log('Send lowercase ASCII string and press Enter to process');
});


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Type a lowercase string and press Enter to test:');
console.log('Type "quit" to exit\n');

rl.on('line', (input) => {
    if (input.toLowerCase() === 'quit') {
        console.log('Goodbye!');
        rl.close();
        server.close();
        process.exit(0);
    }
    
    console.log(`\nInput: "${input}"`);
    const result = processInput(input);
    console.log(result);
    console.log('\n' + '-'.repeat(40) + '\n');
    console.log('Type another string or "quit" to exit:');
});

