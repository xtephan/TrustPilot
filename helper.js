// TODO: header

class Helper {

    /**
     * Create a map with the alpha in the string and the number of occurances
     * 
     * @param {string} string
     * @return {array}
     */
    static getCharactersMapFromString(string = '') {

        // Remove all spaces and characters
        let map = {};
        const alphaString = Helper.removePunctuation(string);
        
        // Create a map with the alpha in the string and the number of occurances 
        Array
            .from(alphaString)
            .forEach( (thisChar) => {

                if( !map.hasOwnProperty(thisChar) ) {
                    map[thisChar] = 0;
                }

                map[thisChar]++;
            });

        return map;
    }

    /**
     * Removes punctuation
     * 
     * @param {string} string
     * @return {string}
     */
    static removePunctuation(string = '') {
        return string.replace(/[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-\s]/gi,'');
    }

}

module.exports = Helper;