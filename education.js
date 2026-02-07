// education.js
function openEducation() {
    if(typeof sounds !== 'undefined') sounds.click.play(); 
    document.getElementById("educationModal").style.display = "block"; 
    showAchievement("The Scholar 🎓", "Academic background accessed.");
}

function closeEducation() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("educationModal").style.display = "none"; //
}