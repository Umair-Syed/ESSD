import ssh from 'ssh2';


export function executeCommandOnSSH(command: string, host: string, username: string, password: string): Promise<string> {
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
          console.log(`Ending SSH connection with ${host}`)
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


/**
 * Parses a size string and converts it to gigabytes (GB).
 * @param sizeStr - The size string to parse. Format example: 1500M, 1.5G
 * @returns The size in gigabytes (GB). Example: 1.5
 */
export function parseSizeToGB(sizeStr: string): number {
  const unit = sizeStr.slice(-1);
  const value = parseFloat(sizeStr.slice(0, -1));
  switch (unit) {
    case 'G':
      return value;
    case 'M':
      return value / 1024;
    case 'T':
      return value * 1024;
    default:
      return 0; // or appropriate default value or error handling
  }
}
