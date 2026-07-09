document.addEventListener("DOMContentLoaded", function () {
    const loadAllBtn = document.getElementById("loadAllUsers")
    const loadLimitedBtn = document.getElementById("loadLimitedUsers")
    const userIdInput = document.getElementById("userIdInput")
    const userDataContainer = document.getElementById("userData")
    const findUserBtn = document.getElementById("findUserBtn")
    const dbStatus = document.getElementById("dbStatus");

    function fetchData(url, callBack) {
        userDataContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading data from ${url}
        </div>
        `
        fetch(url)
            .then(function (response) {
                if (!response.ok) {
                    throw new error('HTTP error! status:' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                if (data && data.length >= 0) {
                    dbStatus.innerHTML = `
                <span style="color: green"><i class="fas fa-check-circle"></i> Database connection successful! found  ${data.length} users</span>
                `
                }
                callBack(null, data);
            })
            .catch(function (error) {
                dbStatus.innerHTML = `
                <span style="color: red"><i class="fas fa-exclamation-circle"></i> Database connection error: ' + error.message +'</span>
                `;
                callBack(error, null);
            });
    }

    function displayUsers(users) {
        if (!users || users.length === 0) {
            userDataContainer.innerHTML = `
        <div class="error">
            <i class="fas fa-info-circle"></i> No users found in the database 
            <p> Make sure your 'users' table exists and contains data.</p>
        </div>
        `
            return;
        }

        let html = `
        <h2 style="margin:20px 0;">
            <i class="fas fa-list"></i> User records (${users.length} users)
        </h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const usersArray = Array.isArray(users) ? users : [users];

        usersArray.forEach(function (user) {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name ||  "N/A"}</td>
                    <td>${user.age}</td>
                    <td class="action-buttons">
                        <button class="btn-small btn-view"><i class="fas fa-eye"></i>View</button>
                        <button class="btn-small btn-edit" id="editBtn"><i class="fas fa-edit"></i>Edit</button>
                        <button class="btn-small btn-delete delStd" data-id="${user.id}"><i class="fas fa-trash"></i>Delete</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        </div>
        `;
        userDataContainer.innerHTML = html;
    }

    loadAllBtn.addEventListener("click", function () {
        fetchData('http://localhost:3000/student', function (err, data) {
            if (err) {
                userDataContainer.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i> Error : ${err.message} 
                    <p> Make sure your server is running on port 3000 and the API endpoints are correct.</p>
                    <p>Check your server console for database connection errors.</p>
                </div>
                `;
            } else {
                displayUsers(data);
            }
        });
    });

    loadLimitedBtn.addEventListener("click", function () {
        fetchData('http://localhost:3000/student/limit', function (err, data) {
            if (err) {
                userDataContainer.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i> Error : ${err.message} 
                    <p> Make sure your server is running on port 3000 and the API endpoints are correct.</p>
                    <p>Check your server console for database connection errors.</p>
                </div>
                `;
            } else {
                displayUsers(data);
            }
        });
    });

    findUserBtn.addEventListener("click", function () {
        const studentId = userIdInput.value.trim();
        if (studentId) {
            fetchData('http://localhost:3000/student/' + studentId, function (err, data) {
                if (err) {
                    userDataContainer.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i> Error : ${err.message} 
                        <p> Make sure your server is running on port 3000 and the API endpoints are correct.</p>
                        <p>Check your server console for database connection errors.</p>
                    </div>
                    `;
                } else {
                    displayUsers(data);
                }
            });
        } else {
            userDataContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i> Please enter a valid student ID 
            </div>
            `;
        }

    });

    document.querySelectorAll('.delStd').forEach(btn => {
        btn.addEventListener("click", (e)=>{
            const stud_id = e.currentTarget.dataset.id;
            console.log("hello");
            fetchData('http://localhost:3000/student/delete/' + stud_id, function (err, data) {
            if (err) {
                userDataContainer.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i> Error : ${err.message} 
                        <p> Make sure your server is running on port 3000 and the API endpoints are correct.</p>
                        <p>Check your server console for database connection errors.</p>
                    </div>
                    `;
            } else {
                console.log(id);
            }
        });
        })
    })

    function deleteStudent(id) {
        console.log(id);
        fetchData('http://localhost:3000/student/delete/' + id, function (err, data) {
            if (err) {
                userDataContainer.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i> Error : ${err.message} 
                        <p> Make sure your server is running on port 3000 and the API endpoints are correct.</p>
                        <p>Check your server console for database connection errors.</p>
                    </div>
                    `;
            } else {
                console.log(id);
            }
        });
    }

    document.getElementById("userRegistrationForm").addEventListener("submit", function(){
        const name = document.getElementById("userNameInput").value;
        const age = document.getElementById("userAgeInput").value;
        fetchData('http://localhost:3000/student/register', {
            method:'post',
            headers:{'content-type':'application/json'},
            body:JSON.stringify({name,age})
        } )
        .then(function(response){
            console.log("done");
            response = response.json;
        })
        .catch(function(err){
            console.log("error");
            dbStatus.innerHTML = `
                <span style="color: red"><i class="fas fa-exclamation-circle"></i> Database connection error: ' + error.message +'</span>
                `;
        });
    })

});