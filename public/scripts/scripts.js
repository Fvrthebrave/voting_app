var addButton = document.getElementById("add-field");
var fieldContainer = document.getElementById("field-container");
var fieldCount = 2;

addButton.addEventListener("click", function(e) {
    e.preventDefault();
    fieldCount++;
    var newField = document.createElement("input");
    newField.style.display = "block";
    newField.name = "field" + fieldCount;
    newField.className += "field-spacer";
    fieldContainer.appendChild(newField);
});