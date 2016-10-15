/**
 * Trustpilot code challange anagram solver
 * http://followthewhiterabbit.trustpilot.com/cs/step3.html
 */

// Libs
const WordListProvider = require('./wordListProvider');
const AnagramSolver = require('./anagramSolver');
const config = require('./config.json');

// Verify args
if( !config.wordListFilePath ) {
    throw "wordListFilePath is a required configuration!";
}

if( !config.anagram ) {
    throw "anagram is a required configuration!";
}

if( !config.md5Checksum ) {
    throw "md5Checksum is a required configuration!";
}

// Generate a wordList
console.log('Generating a list of candidate words...');

const wordListProvider = new WordListProvider({
    filePath : config.wordListFilePath
});

// Read from it
wordListProvider.getWordList((err,wordList)=>{

    if(err) {
        console.log(`Error getting the wordList.`);
        return;
    }

    // Solve the anagram
    console.log(`Got ${wordList.length} words from file.`);

    const anagramSolver = new AnagramSolver({
        anagram : config.anagram,
        wordList : wordList, 
        md5Checksum : config.md5Checksum ,
        maxWordCount : config.maximumWordCount
    });

    console.time("Solve anagram");
    const answer = anagramSolver.doYourJob();
    console.timeEnd("Solve anagram");

    if( answer ) {
         console.log("-----------")
         console.log(`Got "${answer}" as a match. Ohh yeahhh!`);
    } else {
         console.log(`Could not find anagram!`);
    }

});

// If you got to read this far into the code, thank you for your interest!
//
// PS: I also read your code from tp.widget.bootstrap. I guess your life will be much easier 
// once more browser-vendors will start implementing IntersectionObserver API :)
