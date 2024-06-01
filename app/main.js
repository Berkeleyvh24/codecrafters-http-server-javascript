const net = require("net");
const fs = require('node:fs');

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        request = data.toString()
        url = request.split(" ")[1]
        console.log(process.argv[3])
        if(url == '/'){
            socket.write('HTTP/1.1 200 OK\r\n\r\n')
        }else if(url.includes('/echo/')){
            let str = url.split('/').pop();
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`)
        }else if(url.includes('/user-agent')){
            let userString = 'User-Agent: '
            let str = request.substr(request.indexOf(userString)+userString.length, request.length);
            let userAgentResult = str.replace(/\s/g, "")
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentResult.length}\r\n\r\n${userAgentResult}`)
        }else if(url.includes('/files/')){
            let fileName = url.split('/').pop()
            let directory = process.argv[3] 
            console.log(fileName, '++++', directory)
            if(fs.existsSync(directory + fileName)){
                console.log('-----')
                const data = fs.readFileSync(directory + fileName, 'utf8');
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`)
            }else{
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
            }
        }
        else{
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
        }
        socket.end();
    });
});

server.listen(4221, "localhost");
