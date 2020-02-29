#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import convert from './convert.mjs'

const help = () => {
    console.error('Usage: vtt2srt [vtt_file] [srt_file]')
    process.exit(0)
}

const cli = process.argv.slice(2)

if (typeof cli[0] === 'string' && cli[0].toLocaleLowerCase().indexOf('help') > -1) {
    help()
}

process.stdout.on('error', err => {
    if (err.code !== 'EPIPE') throw err
})

function createDirectory(input) {
    try {
        if (fs.statSync(input).isDirectory()) {
            return true
        } else {
            console.error(`Directory occupied by file, At ${input}`)
            return false
        }
    } catch {
        if (createDirectory(path.join(input, '..'))) {
            fs.createDirectory(input)
            return true
        } else {
            return false
        }
    }
}

/**
 * Convert all .vtt files in the directory to .srt files
 * @param {String} input path
 * @param {String} output path
 */
function writeDirectory(input, output) {
    const dirs = fs.readdirSync(input)
    for (let dir of dirs) {
        const cur_in = path.join(input, dir)
        const cur_out = path.join(output, dir)
        const file = fs.statSync(cur_in)
        if (file.isDirectory()) {
            writeDirectory(cur_in, cur_out)
            // return void 0
            continue
        } else if (!file.isFile || path.extname(cur_in) !== '.vtt') {
            continue
        }
        if (createDirectory(path.parse(cur_out).dir)) {
            write(cur_in, cur_out.replace('.vtt', '.srt'))
        }
    }
}

/**
 * Convert .vtt file to .srt file
 * @param {String} input 
 * @param {String} output 
 */
function write(input, output) {
    // if (fs.existsSync(output)) {
    //     throw new Error(`File already exists, At ${output}`)
    // }
    // console.log(input, output)
    fs.createReadStream(input).pipe(convert()).pipe(fs.createWriteStream(output))
}

async function main() {
    if (cli.length === 0) {
        return help()
    }
    const pwd = process.cwd()
    let input = path.resolve(cli[0])
    if (!path.isAbsolute(input)) {
        input = path.join(pwd, input)
    }
    if (!fs.existsSync(input)) {
        throw new Error(`File does not exist, At ${cli[0]}`)
    }
    if (cli.length >= 2) {
        let output = path.resolve(cli[1])
        if (!path.isAbsolute(output)) {
            output = path.join(pwd, output)
        }
        const file = fs.statSync(input)
        if (file.isDirectory()) {
            writeDirectory(input, output)
        } else if (file.isFile) {
            write(input, output)
        }
    } else if (cli.length === 1) {
        const file = fs.statSync(input)
        if (file.isDirectory()) {
            writeDirectory(input, input)
        } else if (file.isFile) {
            write(input, input.replace(path.extname(input), '.srt'))
        }
    }
}

main()