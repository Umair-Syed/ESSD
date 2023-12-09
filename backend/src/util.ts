import ssh from 'ssh2';


function executeCommandOnSSH(command: string, host: string, username: string, password: string) {
  return new Promise((resolve, reject) => {
    const conn = new ssh.Client();
    conn.on('ready', () => {
      console.log('Client :: ready');
      conn.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let data = '';
        stream.on('close', (code: number, signal: string) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
          resolve(data);
        }).on('data', (chunk: Buffer) => {
          data += chunk;
        }).stderr.on('data', (chunk: Buffer) => {
          data += chunk;
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host: host,
      port: 22,
      username: username,
      password: password
    });
  });
}

export default executeCommandOnSSH;