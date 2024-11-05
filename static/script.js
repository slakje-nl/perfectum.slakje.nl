function onPageLoaded() {
    $('#wordInput').focus();

    $('#wordInput').on('input',function(e){
        loadWords();
        return false;
    });

    window.dictionary = [];
    Papa.parse("https://perfectum.slakje.nl/dictionary.csv?_slakje_version=53fe48d", {
        download: true,
        worker: true,
        header: true,
        step: function(row) {
            window.dictionary.push(row.data);
        },
        complete: function() {
            loadWords();
            $("#searchResultSpinner").hide();
        }
    });
}

function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function dictionaryRowContainsSearchedValue(row, searchedValue) {
    for (const [key, value] of Object.entries(row)) {
        if (key !== "perfectum_verb" && normalizeText(value).includes(normalizeText(searchedValue))) {
            return true
        }
    }
    return false
}

function findDictionaryRowsMatchingSearchedValue(dictionary, searchedValue) {
    if (normalizeText(searchedValue) === "") {
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
    if (normalizeText(searchedValue) === "") {
        return text
    }

    // find matching positions, replace with what was there originally but underscored
    let normalizedText = normalizeText(text);
    let normalizedValue = normalizeText(searchedValue);
    let position = normalizedText.lastIndexOf(normalizedValue);
    while (position !== -1) {
        let leftPart = text.slice(0, position);
        let cutPart = text.slice(position, position + normalizedValue.length);
        let rightPart = text.slice(position + normalizedValue.length);

        let underlined = $("<span>", {class: "text-decoration-underline", text: cutPart});
        text = leftPart + underlined.prop('outerHTML') + rightPart;

        normalizedText = normalizeText(text);
        normalizedValue = normalizeText(searchedValue);
        position = normalizedText.lastIndexOf(normalizedValue, position - 1);
    }

    return text;
}

function loadWords() {
    let searchedValue = $("#wordInput").val().toLowerCase();

    $('#searchResult').empty();
    $("#searchResultEmpty").addClass("d-none");

    let labelClass = "fw-lighter small pe-1";
    let matchingWords = findDictionaryRowsMatchingSearchedValue(window.dictionary, searchedValue);
    matchingWords.forEach(element => {
        let elem = $("<li>", {class: "list-group-item"});
        elem.append($("<small>", {class: labelClass, html: "infinitief"}));
        elem.append($("<span>", {class: "fw-bold", html: replaceSearchedValueWithUnderlined(element["infinitive"], searchedValue)}));
        elem.append($("<br>"));
        elem.append($("<small>", {class: labelClass, html: "imperfectum"}));
        elem.append($("<span>", {html: replaceSearchedValueWithUnderlined(element["imperfectum"], searchedValue)}));
        elem.append($("<br>"));
        elem.append($("<span>", {class: labelClass, html: "perfectum"}));
        if (element["perfectum_verb"] !== "-") {
            elem.append($("<span>", {class: "text-info fw-light", text: element["perfectum_verb"]}));
        }
        elem.append($("<span>", {class: "ps-1", html: replaceSearchedValueWithUnderlined(element["perfectum"], searchedValue)}));
        elem.append($("<br>"));
        elem.append($("<span>", {class: labelClass, html: "po polsku"}));
        elem.append($("<span>", {html: replaceSearchedValueWithUnderlined(element["polish"], searchedValue)}));

        $("#searchResult").append(elem);
    });

    if (matchingWords.length === 0) {
        $("#searchResultEmpty").removeClass("d-none");
    }
}

window.onload = onPageLoaded;
