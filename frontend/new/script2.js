document.addEventListener("DOMContentLoaded", function () {
    const name = document.getElementById("userNameInput");
    const age = document.getElementById("userAgeInput");
    const dbStatus = document.getElementById("dbStatus");

    document.getElementById("userRegistrationForm").addEventListener("submit", function(e){
        e.preventDefault();
        fetch('http://localhost:3000/student/register', {
            method:'post',
            headers:{'content-type':'application/json'},
            body:JSON.stringify({name: name.value, age: age.value})
        } )
        .then(function(response){
            dbStatus.innerHTML = `
                <span style="color: green"><i class="fas fa-check-circle"></i> Student registered successfully.</span>
                `;
            return response.json();
        })
        .then(data => console.log(data))
        .catch(function(err){
            return dbStatus.innerHTML = `
                <span style="color: red"><i class="fas fa-exclamation-circle"></i> Database connection error: ' + ${err.message} +'</span>
                `;
        });
    })

});