$('document').ready(function(){

    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function checkVowels(string) {
            let lowerCase = string.toLowerCase();
            let word = lowerCase.split("");
            let vowelsArray = ["a","o","i","u","y"];
            const result = word.filter(letter => vowelsArray.includes(letter));
            return result.length > 0;
    }

    var isValid = false;

    function assignVariable(data){
        isValid = data;
    }

    //make get json synchronous 
    $.ajaxSetup({
        async: false
    });

    function isValidWord(word) {

        isValid = false;

        var filename = "/word_select/" + value.toString() + "_common.js";
        
        $.getJSON(filename, function(data){
            isValid = Object.values(data).includes(word);
        });

        //check larger dic 
        if(isValid == false) {

            filename = "/dics/" + value.toString() + ".js";
        
            $.getJSON(filename, function(data){
                isValid = Object.values(data).includes(word);
            });
        }

        return isValid;

    }

      
    


    //main elems
    var body = document.getElementsByTagName('body')[0];
    
    //word length
    var value = 5;

    //current row
    let cur_row = 0;

    //set up word
    let wurdle_word = "";

    //function to remove elements by class
    function removeElementsByClass(className){
        const elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    function chooseWord(len) {

        var filename = "/word_select/" + len.toString() + "_common.js";
        $.getJSON(filename, function(result){

            var good_word = false;

            //ensure word contains vowels to make the game easier
            while(good_word == false){
                var json_len = Object.keys(result).length - 1;
                var rndInt = randomIntFromInterval(0, json_len);
                console.log(result[(rndInt).toString()]);
                wurdle_word = result[(rndInt).toString()];
                good_word = checkVowels(wurdle_word);
            }

        }); 
    }

    // Create Grid for letter input

    function loadGrid(selected) {
        var size = selected.target.value;

        //first clear all rows if exist
        removeElementsByClass("row");
        cur_row = 0;
        value = size;

        for(let i=0; i < size; i++) {

                var rowNum = "r"+i;
                var x = document.createElement('div');

                x.id = rowNum;
                x.classList.add("row");

                if (i == 0) {
                    x.classList.add("current");
                }

                for(let j=0; j < size; j++) {

                    var y = document.createElement("INPUT");

                    y.setAttribute("type", "text");
                    y.setAttribute("maxlength", "1");

                    y.className = "letter_input";

                    if(i!=0){
                        y.setAttribute("disabled", "true");
                    }

                    x.appendChild(y);
                }

                body.appendChild(x);
        }

        chooseWord(size);
    }

    document.getElementById("ddlViewBy").addEventListener('change', loadGrid, false);

    //dispatch event to init grid
    //set up grid
    const event = new Event('change');
    // Dispatch the event.
    document.getElementById("ddlViewBy").dispatchEvent(event);

        
    let all_rows = document.getElementsByClassName("row");


    function disable(rowNum) {
        [...document.getElementById(rowNum).children].forEach(child => 
            child.setAttribute("disabled", "true"))
        return;
    }

    function enable(rowNum) {
        [...document.getElementById(rowNum).children].forEach(child => 
            child.removeAttribute("disabled"))
        return;
    }

    //if return 0 - word incomplete
    //if return 1 - word does not exist (use spellcheck api)
    //hide and unhide error messages

    function collectWord(){
        let guess = "";

        [...document.getElementById("r"+cur_row).children].forEach(child => 
            guess+=child.value.toString()      
        );
        
         //if word not long enough
        if(guess.length < value) {
            return 0;
        }

        else if(!isValidWord(guess)) {
            return 1;
        }

        else {
            return guess;
        }
    }

    function errorMessage(error_code){

        if(error_code == 0){
            document.getElementById("incomplete").style.display = "block";
        }

        else if(error_code == 1) {
            document.getElementById("invalid").style.display = "block";
        }
        return;
    }

    function hideErrorMessage(){
        document.getElementById("incomplete").style.display = "none";
        document.getElementById("invalid").style.display = "none";
        return;
    }

    function press() {

        hideErrorMessage()

        //remove current status
        all_rows[cur_row].classList.remove("current");
        all_rows[cur_row].classList.add("prev");

        //disable
        disable(("r"+cur_row).toString());

        //enable and set new row to currrent
        cur_row += 1;
        all_rows[cur_row].classList.add("current");

        enable(("r"+cur_row).toString())

        return;
    }

    function correctWord(word) {

        let correction_str = wurdle_word;
        var letter_elems =  [...document.getElementById("r"+cur_row).children];
        
        //prevent program from telling you there are two letters in a word if correct letter used in multiple placees
        for(let i = 0; i < value; i++) {
            if(word[i].toLowerCase() == wurdle_word[i].toLowerCase()){
                correction_str = correction_str.substr(0, i) + "-" + correction_str.substr(i + 1);
                console.log(wurdle_word);
            }
        }

        for(let i = 0; i < value; i++) {          
            //letter in correct place
            if(correction_str[i] == "-"){
                letter_elems[i].classList.add("correct_location");
            }
            else if (correction_str.includes(word[i])){
                //prerent user from thinking there are two of a letter in a word if one of them is correct
                correction_str = correction_str.replace(word[i], '_'); // Remove the first one
                letter_elems[i].classList.add("correct_letter");
            }
            else {
                letter_elems[i].classList.add("wrong_letter");
            }
        }

    }

    //build win modal

    // Get the modal
        var modal = document.getElementById("myModal");

        // Get the button that opens the modal
        var btn = document.getElementById("myBtn");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
        modal.style.display = "none";
        }

        document.getElementById("play_again").onclick = function(event) {
            location.reload();
        }
        
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        }


    document.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          // returns 0 if not long enough, 1 if not valid word
          // and the word if acceptable
          var user_guess = collectWord();
        
          //Invalid
          if(user_guess == 0 || user_guess == 1)
          {
              errorMessage(user_guess);
          }

          else if(cur_row < value) {
                correctWord(user_guess);

                //show pop up
                if(user_guess == wurdle_word) {

                    // document.getElementById
                    modal.style.display = "block";
          
                }

                            //No more guesses
                else if (cur_row == (value - 1)){
                    document.getElementById("win_lose").innerHTML = "You Lost";
                    document.getElementById("reveal_word").innerHTML = "The Word Was: <span>"+ wurdle_word.toString() +"</span>";

                    modal.style.display = "block";
                }
                
                else {
                    press();
                }
            }
                  
        }
      });

});
