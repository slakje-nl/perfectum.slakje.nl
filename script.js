function onPageLoaded() {
    $('#wordInput').focus();

    $('#wordInput').on('input',function(e){
        loadWords();
        return false;
    });

    loadFile();

    $("#searchResultSpinner").hide();
}

function loadFile() {
    $.get( "./dictionary.csv?_=2024.11.4.1", function( data ) {
        let dictionaryLines = data.split(/\n/);
        let headers = dictionaryLines.shift().split(";");

        window.dictionary = [];
        dictionaryLines.forEach(dictionaryLine => {
            if (dictionaryLine === "") {
                return true;
            }

            let row = {};
            dictionaryLine.split(";").forEach(function (value, i) {
                let key = headers[i];
                row[key] = value;
            });

            window.dictionary.push(row);
        })

        loadWords();
    });
}

function dictionaryRowContainsSearchedValue(row, searchedValue) {
    for (const [key, value] of Object.entries(row)) {
        if (key !== "perfectum_verb" && value.includes(searchedValue)) {
            return true
        }
    }
    return false
}

function findDictionaryRowsMatchingSearchedValue(dictionary, searchedValue) {
    if (searchedValue === "") {
        return dictionary
    }

    let result = [];
    dictionary.forEach(element => {
        if (dictionaryRowContainsSearchedValue(element, searchedValue)) {
            result.push(element);
        }
    })
    return result;
}

function replaceSearchedValueWithUnderlined(text, searchedValue) {
    if (searchedValue === "") {
        return text
    }

    let underlined = $("<span>", {class: "text-decoration-underline", text: searchedValue});
    return text.replaceAll(searchedValue, underlined.prop('outerHTML'));
}

function loadWords() {
    let searchedValue = $("#wordInput").val().toLowerCase();

    $('#searchResult').empty();

    let labelClass = "fw-lighter small pe-1";
    findDictionaryRowsMatchingSearchedValue(window.dictionary, searchedValue).forEach(element => {
        let elem = $("<li>", {class: "list-group-item"});
        elem.append($("<small>", {class: labelClass, html: "infinitief"}));
        elem.append($("<span>", {class: "fw-bold", html: replaceSearchedValueWithUnderlined(element["infinitive"], searchedValue)}));
        elem.append($("<br>"));
        elem.append($("<small>", {class: labelClass, html: "imperfectum"}));
        elem.append($("<span>", {html: replaceSearchedValueWithUnderlined(element["imperfectum"], searchedValue)}));
        elem.append($("<br>"));
        elem.append($("<span>", {class: labelClass, html: "perfectum"}));
        elem.append($("<span>", {class: "text-info fw-light", text: element["perfectum_verb"]}));
        elem.append($("<span>", {class: "ps-1", html: replaceSearchedValueWithUnderlined(element["perfectum"], searchedValue)}));
        elem.append($("<br>"));
        elem.append($("<span>", {class: labelClass, html: "po polsku"}));
        elem.append($("<span>", {html: replaceSearchedValueWithUnderlined(element["polish"], searchedValue)}));

        $("#searchResult").append(elem);
    });
}

window.onload = onPageLoaded;
