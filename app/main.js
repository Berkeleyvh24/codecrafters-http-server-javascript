const net = require("net");
const fs = require('node:fs');
const zlib = require('zlib');

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        request = data.toString()
        requestType = request.split(" ")[0]
        url = request.split(" ")[1]
        let fileName = url.split('/').pop()
        let directory = process.argv[3] 
        console.log(fileName, "+++++")
        if(url == '/'){
            socket.write('HTTP/1.1 200 OK\r\n\r\n')
        }else if(url.includes('/echo/')){
            let requestArray = request.split("\r\n")
            const encodingHeader = requestArray.find(e => e.includes('Accept-Encoding'))?.split(': ')[1];
            const acceptingHeader =  encodingHeader?.includes('gzip')
            const compressOrUncompressString =  acceptingHeader ? zlib.gzipSync(fileName) : fileName;
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${compressOrUncompressString.length}\r\n${acceptingHeader ? 'Content-Encoding: gzip\r\n' : ''}\r\n`)
            socket.write(compressOrUncompressString)
        }else if(url.includes('/user-agent')){
            let userString = 'User-Agent: '
            let str = request.substr(request.indexOf(userString)+userString.length, request.length);
            let userAgentResult = str.replace(/\s/g, "")
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentResult.length}\r\n\r\n${userAgentResult}`)
        }else if(url.includes('/files/') && requestType == 'GET'){
            if(fs.existsSync(directory + fileName)){
                const content = fs.readFileSync(directory + fileName, 'utf8');
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`)
            }else{
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
            }
        }else if(url.includes('/files/') && requestType == 'POST'){
            let postRequest = request.split("\r\n")
            let content = postRequest[postRequest.length - 1]
            fs.writeFileSync(directory + '/' + fileName, content)
            socket.write('HTTP/1.1 201 Created\r\n\r\n')
        }
        else{
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
        }
        socket.end();
    });
});

server.listen(4221, "localhost");
