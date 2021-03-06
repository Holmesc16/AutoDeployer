const fs = require('fs');
const sql = require('mssql');
const { exec } = require('child_process')

module.exports = (payload, response) => {
    let items = payload.recordset
    getDirName = (path) => {
        return path.replace('git@github.com:CityOfLewisvilleTexas/', '')
    }
    items.forEach(item => {
        item.deploymentURL.includes('https://apps.cityoflewisville.com/')
            ? item.deploymentURL = item.deploymentURL.replace('https://apps.cityoflewisville.com/', 'C:\\inetpub\\wwwroot\\')
            : item.deploymentURL = item.deploymentURL

        return new Promise((resolve, reject) => {
            if (fs.existsSync(item.deploymentURL)) {
                exec(`git init`, { cwd: item.deploymentURL }, (stdout, stderr) => {
                    if (stderr) {
                        if (stderr.includes('fatal: not a git repository')) {
                            console.log('No Git Repo Associated with this Directory. Please execute "git init" and pull from a valid remote.')
                            return
                        }
                    }
                    else {
                    stdout === null
                        ? console.log(`Git initialized repository in ${item.deploymentURL}`)
                        : console.log(stdout)
                    }

                })
                exec(
                    `git pull ${item.gitURL} master`,
                    { cwd: item.deploymentURL },
                    (stdout, stderr) => {
                        if (stderr) {
                            console.log(stderr)
                        }
                        else {
                        stdout === null
                            ? console.log(`From ${item.gitURL} * branch master -> FETCH_HEAD`)
                            : console.log(stdout)
                        resolve()
                        }
                    }
                )
            }
            else if (!fs.existsSync(item.deploymentURL)) {
                //@OTODO: \\\\ax1viis1\\c$\\inetpub\\wwwroot Does not work
                //"UNC paths are not supported.  Defaulting to Windows directory."
                item.deploymentURL = 'C:\\Users\\cholmes\\Desktop' //'C:\\Users\\cholmes\\Desktop\\'
                exec(`mkdir ${getDirName(item.gitURL)}`, { cwd: item.deploymentURL }, (stdout, stderr) => {
                    if (stderr) {
                        console.log(stderr)
                    }
                    else {
                    stdout === null
                        ? console.log(`Directory ${getDirName(item.gitURL)} created on ${item.deploymentURL}`)
                        : console.log(stdout)
                    }
                })
                exec(`git clone ${item.gitURL}`, { cwd: item.deploymentURL }, (stdout, stderr) => {
                    if (stderr) {
                        console.log(stderr)
                    }
                    else {
                    stdout === null
                        ? console.log(`Successfully Cloned ${getDirName(item.gitURL)} into ${item.deploymentURL}`)
                        : console.log(stdout)

                    resolve()
                    }
                })
            }
        })
    })
    sql.close()
    response.send(payload.recordset)
}