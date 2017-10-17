var addButton = document.getElementById("add-field");
var fieldContainer = document.getElementById("field-container");
var fieldCount = 1;

addButton.addEventListener("click", function(e) {
    e.preventDefault();
    fieldCount++;
    var newField = document.createElement("input");
    newField.style.display = "block";
    newField.name = "field" + fieldCount;
    fieldContainer.appendChild(newField);
});