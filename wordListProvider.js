/**
 * Class for reading and processing the words from the input file
 */
const fs = require('fs');

class WordListProvider {

    /**
     * Constructor
     * @param {object} _args
     */
    constructor( _args ) {

        // Default to empty object
        let args = _args || {};

        if( !args.filePath ) {
            throw "WordListProvider expects filePath as parameter!";
        }

        // Assign class-wide variables
        this.filePath = String(args.filePath);
        this.wordsList = [];
        this.bufferString = '';
        
        // Bind to main context
        this.onChunkReceived = this.onChunkReceived.bind(this);
        this.filterWord = this.filterWord.bind(this);
    }

    /**
     * Normalizes a word
     * @param {string} _thisWord
     * @return {string}
     */
    normalizeWorld(_thisWord) {
        return _thisWord.toLowerCase().trim();
    }

    /**
     * Determines if a candidate word fulfills all the criteria
     * @param {string} thisWord
     * @return {boolean}
     */
    filterWord(thisWord) {

        if( thisWord.length === 0) {
            return false;
        }

        return true;
    }

    /**
     * Reads the word file. Upon completion it executes the callback
     * with a list of words that fulfill the contain only accepted chars
     * @param {function} callback
     */
    getWordList(callback) {
        
        fs.createReadStream(this.filePath, {
            flags: 'r',
            encoding: 'utf8',
        })
        .on('error', () => { 
            callback(true, null);
         })
        .on('data', this.onChunkReceived)
        .on('end', ()=>{
            callback(null, this.wordsList);
        });

    }

    /**
     * Callback function for whenever a chunk of the wordlist is being read
     * @param {string} chunks
     */
    onChunkReceived(chunk) {

        // Extract the words from the chunk, normalize them and filter out 
        // obvious non-candidates
        const words = ( this.bufferString + chunk )
            .split("\n")
            .map(this.normalizeWorld)
            .filter(this.filterWord);
        
        // Push all the words from the current chunk, except the last one to the global word list
        this.wordsList.push.apply( this.wordsList, words.slice(0, -1) );

        // Process the last word in the next chunk, as it may truncated
        this.bufferString = words.pop();

    }

}

module.exports = WordListProvider;