  /* 
   * To change this license header, choose License Headers in Project Properties.
   * To change this template file, choose Tools | Templates
   * and open the template in the editor.
   */
'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let mimes = {
  'html' : 'text/html',
  '.css' : 'text/css',
  '.js'  : 'text/javascript',
  '.gif' : 'image/gif',
  '.jpg' : 'image/jpeg',
  '.png' : 'image/png'
};

function fileAccess(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.F_OK, error => {
      if (!error) {
        resolve(filepath);
      } else {
        reject(error);
      }
    });
  });
}

function fileReader(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (error, content) => {
      if (!error) {
        resolve(content);
      } else {
        reject(error);
      }
    });
  });
}

// Streaming file reader
function streamFile(filepath) {
  return new Promise((resolve, reject) => {
    let fileStream = fs.createReadStream(filepath);
    
    fileStream.on('open', () => {
      resolve(fileStream);
    });
    
    fileStream.on('error', error => {
      reject(error);
    });
  });
} 

// Process requests
function webserver(req, res) {
  // If the request is '/', load index.html, else load the requested file
  let baseURI = url.parse(req.url);
  let filepath = __dirname + 
//    '/' + 
    (baseURI.pathname === '/' ? 'index.html' : baseURI.pathname);
  console.log("Path: " + filepath);
  let contentType = mimes[path.extname[filepath]];
  
  fileAccess(filepath)
    .then(streamFile)   //.then(fileReader(filepath))
    .then(fileStream => { // .then(content
      res.writeHead(200, {'Content-type' : contentType});
      // res.end(content, "utf-8");
      fileStream.pipe(res);
    })
    .catch(error => {
      res.writeHead(404);
      res.end(JSON.stringify(error));
    });
}

// Start HTTP server
http.createServer(webserver).listen(8081, () => {
  console.log('Server running at http://localhost:8081/');
});
  
  
  
