'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const envJson = require('./env');
const execSync = require('child_process').execSync;
const fs = require('fs');
let counter = 0;

const runTerminal = gitLinks => {
    if (gitLinks.length < 1) {
        return;
    }
    let firstLink = gitLinks.shift();
    var url = firstLink.replace(`${envJson.scheme}://${envJson.host}`, `${envJson.scheme}://${envJson.credentials}@${envJson.host}`);
    var command = `git clone ${url} ${envJson.directory}/${firstLink.substring(parseInt(envJson.scheme.length) + 3, firstLink.length - 4)}`;
    console.log('\x1b[36m%s\x1b[0m', 'clone: ' + firstLink);
    console.log('\x1b[33m%s\x1b[0m', 'number: ' + ++counter);
    try {
        execSync(command, {stdio: 'inherit'});
        fs.appendFileSync(`${envJson.directory}/gitlab_success.txt`, firstLink + "\n");
    } catch (ex) {
        fs.appendFileSync(`${envJson.directory}/gitlab_errors.txt`, firstLink + "\n");
    }

    runTerminal(gitLinks);
};

const runRequest = page => {
    console.log('Current page: ' + page);
    rp.get(`${envJson.scheme}://${envJson.host}/api/v4/projects?simple=true&per_page=100&page=${page}`, {
        json: true,
        qs: {
            simple: true,
        },
        headers: {
            'PRIVATE-TOKEN': envJson.token
        }
    }).then(projects => {
        let gitLinks = _.map(projects, 'http_url_to_repo');
        console.log('array length: ' + gitLinks.length);
        if (gitLinks.length > 0) {
            runTerminal(gitLinks);
            runRequest(page + 1);
        }

    })

};

runRequest(1);







