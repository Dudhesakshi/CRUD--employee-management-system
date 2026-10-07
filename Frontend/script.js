const BASE_URL = "http://localhost:8080";

const EMPLOYEE_API = `${BASE_URL}/employees`;
const AUTH_API = `${BASE_URL}/auth`;


// ===============================
// LOGIN
// ===============================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;


        try {

            const response = await fetch(
                `${AUTH_API}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const token = await response.text();


            if (!response.ok) {

                throw new Error(token);
            }


            // Store JWT
            localStorage.setItem("token", token);


            // Show dashboard
            showDashboard();


            // Load employees
            loadEmployees();


        } catch (error) {

            console.error(error);

            document.getElementById(
                "loginMessage"
            ).textContent =
                "Invalid email or password.";
        }

    });


// ===============================
// SHOW DASHBOARD
// ===============================

function showDashboard() {

    document.getElementById(
        "loginSection"
    ).style.display = "none";


    document.getElementById(
        "dashboardSection"
    ).style.display = "block";
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("token");

    document.getElementById(
        "dashboardSection"
    ).style.display = "none";


    document.getElementById(
        "loginSection"
    ).style.display = "flex";


    document.getElementById(
        "loginForm"
    ).reset();

}


// ===============================
// GET JWT
// ===============================

function getToken() {

    return localStorage.getItem("token");
}


// ===============================
// AUTH HEADERS
// ===============================

function getAuthHeaders() {

    return {

        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${getToken()}`
    };
}


// ===============================
// LOAD EMPLOYEES
// ===============================

async function loadEmployees() {

    try {

        const response = await fetch(
            EMPLOYEE_API,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to fetch employees"
            );
        }


        const employees =
            await response.json();


        const tableBody =
            document.getElementById(
                "employeeTableBody"
            );


        tableBody.innerHTML = "";


        employees.forEach(employee => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${employee.id}</td>

                <td>${employee.name}</td>

                <td>${employee.email}</td>

                <td>${employee.department}</td>

                <td>${employee.position}</td>

                <td>${employee.salary}</td>

                <td>${employee.dateOfJoining}</td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editEmployee(${employee.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteEmployee(${employee.id})">
                        Delete
                    </button>

                </td>
            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load employees."
        );
    }
}


// ===============================
// ADD / UPDATE EMPLOYEE
// ===============================

document
    .getElementById("employeeForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const employee = {

                name:
                    document.getElementById(
                        "name"
                    ).value,

                email:
                    document.getElementById(
                        "email"
                    ).value,

                department:
                    document.getElementById(
                        "department"
                    ).value,

                position:
                    document.getElementById(
                        "position"
                    ).value,

                salary:
                    parseFloat(
                        document.getElementById(
                            "salary"
                        ).value
                    ),

                dateOfJoining:
                    document.getElementById(
                        "dateOfJoining"
                    ).value
            };


            try {

                let response;


                const editingId =
                    window.editingEmployeeId;


                // UPDATE

                if (editingId) {

                    response =
                        await fetch(
                            `${EMPLOYEE_API}/${editingId}`,
                            {
                                method: "PUT",

                                headers:
                                    getAuthHeaders(),

                                body:
                                    JSON.stringify(
                                        employee
                                    )
                            }
                        );
                }


                // CREATE

                else {

                    response =
                        await fetch(
                            EMPLOYEE_API,
                            {
                                method: "POST",

                                headers:
                                    getAuthHeaders(),

                                body:
                                    JSON.stringify(
                                        employee
                                    )
                            }
                        );
                }


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    logout();

                    return;
                }


                if (!response.ok) {

                    throw new Error(
                        "Operation failed"
                    );
                }


                alert(
                    editingId
                        ? "Employee updated successfully!"
                        : "Employee added successfully!"
                );


                resetForm();

                loadEmployees();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to save employee."
                );
            }

        }
    );


// ===============================
// EDIT EMPLOYEE
// ===============================

async function editEmployee(id) {

    try {

        const response =
            await fetch(
                `${EMPLOYEE_API}/${id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${getToken()}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Employee not found"
            );
        }


        const employee =
            await response.json();


        document.getElementById(
            "name"
        ).value = employee.name;


        document.getElementById(
            "email"
        ).value = employee.email;


        document.getElementById(
            "department"
        ).value =
            employee.department;


        document.getElementById(
            "position"
        ).value =
            employee.position;


        document.getElementById(
            "salary"
        ).value =
            employee.salary;


        document.getElementById(
            "dateOfJoining"
        ).value =
            employee.dateOfJoining;


        window.editingEmployeeId = id;


        document.querySelector(
            ".form-container h2"
        ).textContent =
            "Update Employee";


        document.querySelector(
            "#employeeForm button[type='submit']"
        ).textContent =
            "Update Employee";


        document.getElementById(
            "cancelButton"
        ).style.display =
            "block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load employee."
        );
    }
}


// ===============================
// DELETE EMPLOYEE
// ===============================

async function deleteEmployee(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this employee?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${EMPLOYEE_API}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${getToken()}`
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Delete failed"
            );
        }


        alert(
            "Employee deleted successfully!"
        );


        loadEmployees();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete employee."
        );
    }
}


// ===============================
// CANCEL EDIT
// ===============================

function cancelEdit() {

    resetForm();
}


// ===============================
// RESET FORM
// ===============================

function resetForm() {

    document.getElementById(
        "employeeForm"
    ).reset();


    window.editingEmployeeId = null;


    document.querySelector(
        ".form-container h2"
    ).textContent =
        "Add Employee";


    document.querySelector(
        "#employeeForm button[type='submit']"
    ).textContent =
        "Save Employee";


    document.getElementById(
        "cancelButton"
    ).style.display =
        "none";
}


// ===============================
// CHECK LOGIN WHEN PAGE OPENS
// ===============================

window.addEventListener(
    "load",
    function () {

        const token = getToken();


        if (token) {

            showDashboard();

            loadEmployees();

        }

    }
);