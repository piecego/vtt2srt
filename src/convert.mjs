import through from 'through2'
import split from 'split2'
import pumpify from 'pumpify'
import { EOL } from 'os'

/**
 * pumpify
 * https://www.npmjs.com/package/pumpify
 * 流(Stream)处理程序，合并一系列流，其中一个流错误管道中所有流都将被销毁
 */

/**
 * split2
 * https://www.npmjs.com/package/split2
 * 分割流(Stream)，每一行都是一个块(Chunk)
 */

/**
 * through2
 * https://www.npmjs.com/package/through2
 */

export default function convert() {

    let count = 0
    const reg = new RegExp(`(WEBVTT\s*(FILE)?.*)(${EOL})*`, 'g' )
    /**
     * 
     * @param {String} line 
     * @param {String} enc encode
     * @param {Function} cb 
     */
    const write = (line, enc, cb) => {
      if (line.trim() === '' || line.match(/^\d+$/)) {
        return cb()
      }
      let vtt_line = ''
      if (line.match(/(?:\d{2}:?)+\.\d{3}\s+\-\-\>\s+(?:\d{2}:?)+\.\d{3}/g)) {
        const vtt_comp = line.split('-->')
        vtt_line = vtt_comp.map(str => {
          str = str.replace('.', ',')
          if (str.split(':').length < 3) {
            str = `00:${str.trim()}`
          }
          return str.trim()
        }).join(' --> ')
        vtt_line = vtt_line + EOL
      }
      else if (line.match(reg)) {
        vtt_line = line.replace(reg, '')
      }
      else {
        vtt_line = line + EOL
      }
      if (vtt_line.trim() === '') return cb()
      if (/^Kind:|^Language:/m.test(vtt_line)) {
        return cb()
      }
      if (/^\d{2}:/m.test(vtt_line)) {
        count++
        if (count === 1) {
          vtt_line = `${count}${EOL}${vtt_line}`
        } else {
          vtt_line = `${EOL}${count}${EOL}${vtt_line}`
        }
      }
      cb(null, vtt_line)
    }
  
    return pumpify(split(), through.obj(write))
    
}