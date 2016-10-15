/**
 * Class responsable for solving the anagram
 */

const Helper = require('./helper');
const crypto = require('crypto');

class AnagramSolver {

    /**
     * Constructor
     * @param {object} _args
     */
    constructor(_args) {

        // Default to empty object
        let args = _args || {};

        if( !args.md5Checksum ) {
            throw "AnagramSolver expects md5Checksum as parameter!";
        }

        if( !args.anagram ) {
            throw "AnagramSolver expects anagram as parameter!";
        }

        if( !args.wordList ) {
            throw "AnagramSolver expects wordList as parameter!";
        }

        // Save arguments to classwide
        this.md5Checksum = args.md5Checksum;
        this.maxWordCount = args.maxWordCount || 10;
        this.currentIteration = 0;

        // Bind methods to context
        this.canBeAnagram = this.canBeAnagram.bind(this);

        // Do some pre-calculation in regards to the target anagram
        this.targetAnagramCharMap = Helper.getCharactersMapFromString( args.anagram );
        this.targetAnagramLength = Helper.removePunctuation(args.anagram).length;

        // Filter the wordList down to only the ones that can be used to create the anagram
        this.wordList = args.wordList.filter( this.canBeAnagram );
        this.wordListLength = this.wordList.length;

        console.log(`Reduced the dictionary list to ${this.wordListLength}...`);

        // Create a hashmap of the words
        this.createWordListHashMap();

        // Partition the words by their length
        this.partitionHashMapByLength();
    }

    /**
     * Group toghether words that differ by punctioation, duplicates or ones that
     * are anagrams of
     */
    createWordListHashMap() {

        this.hashMap = {};

        for(let i=0; i<=this.wordListLength; i++) {
            
            let wordHash = Array
                                .from( Helper.removePunctuation(this.wordList[i]) )
                                .sort()
                                .join('');

            if( !this.hashMap.hasOwnProperty(wordHash) ) {
                this.hashMap[ wordHash ] = [];
            }

            this.hashMap[ wordHash ].push( this.wordList[i] );
        }

        this.hashMapArray = Object.keys(this.hashMap);
        this.hashMapArrayLength = this.hashMapArray.length; 

        console.log(`Reduced the search space to ${this.hashMapArrayLength}...`);
    }

    /**
     * Partition the hashmap 
     */
    partitionHashMapByLength() {
        
        this.hashMapPartition = [];
        
        for(let i=0; i<=this.targetAnagramLength; i++) {
            this.hashMapPartition[i] = [];
        }

        for(let i=0; i<this.hashMapArrayLength; i++) {
            this.hashMapPartition[ this.hashMapArray[i].length ].push(this.hashMapArray[i]);
        }

    }

    /**
     * Generates all possible anagram based on the hash entries and 
     * validates it against the MD5 checksum
     * 
     * @param {array} hashEntries
     * @param {array} resultAnagramParts
     * @param {integer} hashEntryIndex
     * 
     * @return {string|boolean}
     */
    findAnagram( hashEntries, resultAnagramParts, hashEntryIndex ) {

        // all hash entries are populated with a possible solution
        if( hashEntryIndex === hashEntries.length ) {
            
            // Construct the diagram
            const thisAnagram = resultAnagramParts.join(' ');

            if( crypto.createHash('md5').update(thisAnagram).digest('hex') === this.md5Checksum) {
                return thisAnagram;
            } else {
                return false;
            }

        }

        // Otherwise continue by generating the next possible anagram
        const possibleAnagramParts = this.hashMap[ hashEntries[hashEntryIndex] ];

        for(let i=0; i<possibleAnagramParts.length; i++) {

            resultAnagramParts[hashEntryIndex] = possibleAnagramParts[i];

            const anagram = this.findAnagram(
                hashEntries, 
                resultAnagramParts, 
                hashEntryIndex+1
            );

            if( anagram !== false ) {
                return anagram;
            }
        } 

        return false;
    }

    /**
     * Do you job!
     * @return {string}
     */
    doYourJob() {
        
        for(let wordLimit=1; wordLimit<=this.maxWordCount; wordLimit++) {
            
            let result = this.findHashAnagram([], 0, wordLimit );

            if( result !== false ) {
                return result;
            }
            
        }
        
        return false;
    }

    /**
     * Checks if a given phrase could be an anagram of the target anagram
     * @param {string}
     * @return {boolean}
     */
    canBeAnagram(phrase) {

        // When you are young, you can be whatever you want
        if( phrase.length === 0 ) {
            return true;
        }

        const phraseMap = Helper.getCharactersMapFromString(phrase);

        // and compare it to the anagram charmap
        for(let thisChar in phraseMap) {
            if(phraseMap.hasOwnProperty(thisChar)) {

                // If the current char does not exist in the anagram map
                // or it appear more times in the current word than the anagram
                // reject it as a possible candidate
                if( 
                    !this.targetAnagramCharMap.hasOwnProperty(thisChar) || 
                    (this.targetAnagramCharMap[thisChar] < phraseMap[thisChar])
                ) {
                   return false;
                }

            }
        }

        return true;
    }

    /**
     * Find the anagram by testing all the reasonable permutation of targetWordCount words
     * @param {array} hashEntries
     * @param {string} currentWordCount
     * @param {string} targetWordCount
     * @result {string|boolean}
     */
    findHashAnagram( hashEntries, currentWordCount, targetWordCount ) {

        // Can I have some progress please?
        if( this.currentIteration % 10000 === 6) {
            console.log(`Testing ${hashEntries.join()}`);
        }
        this.currentIteration++;

        // If the current phrase is the same size as the anagram,
        // Do a lookup in the hashMap and check against the MD5 sum
        const currentPhrase = hashEntries.join(''); 
        const currentPhraseLength = Helper.removePunctuation(currentPhrase).length;

        if( currentPhraseLength === this.targetAnagramLength ) {
            return this.findAnagram(hashEntries, [], 0);
        }

        // Abort if the maximum word count was reached
        if( targetWordCount == currentWordCount ) {
            return false;
        }

        // Determine how many characters are missing from the anagram
        const remaningLenth = (this.targetAnagramLength - currentPhraseLength);

        // Small optimisation: if this is the last word, 
        // check only against words of the missing size
        const limit = targetWordCount - currentWordCount === 1 ? remaningLenth : 1;

        for( let i=remaningLenth; i>=limit; i-- ) {
            for(let j=0; j<this.hashMapPartition[i].length; j++) {

                // Add the next hash
                hashEntries[currentWordCount] = this.hashMapPartition[i][j];

                // Check if the next phrase can become an anagram
                if( !this.canBeAnagram( hashEntries.join('') ) ) {
                        continue;
                }                

                const anagram = this.findHashAnagram(
                    Array.from(hashEntries),
                    currentWordCount+1,
                    targetWordCount
                );

                if( anagram !== false) {
                    return anagram;
                }

            }
        }

        return false;
    }

}

module.exports = AnagramSolver;