document.addEventListener("DOMContentLoaded", () => {
    const locationDropdown = document.getElementById("location");
    const initiateAttendanceForm = document.getElementById("initiateAttendanceForm");
    const responseAlert = document.getElementById("responseAlert");
    const formTitle = document.querySelector(".formHead");

    // Fetch locations from the backend and populate the dropdown
    async function fetchLocations() {
        try {
            const response = await fetch("http://localhost:8080/api/locations"); // Adjust endpoint if needed
            if (!response.ok) {
                throw new Error("Failed to fetch locations.");
            }
            const responseData = await response.json();
            console.log("Fetched response:", responseData); // Debugging log

            // Extract the `data` field from the response
            if (responseData.success && Array.isArray(responseData.data)) {
                populateLocationDropdown(responseData.data);
            } else {
                throw new Error("Invalid response format or no locations found.");
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
            locationDropdown.innerHTML = `<option value="" disabled selected>Error loading locations</option>`;
        }
    }

    // Populate the location dropdown with location names
    function populateLocationDropdown(locations) {
        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location.id; // Store the location ID as the value
            option.textContent = location.name; // Show the location name
            locationDropdown.appendChild(option);
        });
    }

   // Handle form submission
    initiateAttendanceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const courseTitle = document.getElementById("courseTitle").value.trim();
    const duration = parseInt(document.getElementById("duration").value.trim(), 10);
    const selectedLocationId = locationDropdown.value; // Use the location ID
    const failsafeCode = document.getElementById("failsafeCode").value.trim();

    // Retrieve the user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "LECTURER") {
        alert("You must be logged in as a lecturer to initiate attendance.");
        window.location.href = "/IsignApp/login.html"; // Redirect to login page
        return;
    }

    const lecturerId = user.id; // Extract the lecturer ID

    const requestData = {
        courseTitle,
        durationMinutes: duration,
        locationId: selectedLocationId,
        failsafeCode,
        lecturerId
    };

    try {
        const response = await fetch("http://localhost:8080/api/attendance/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from backend:", errorData);
            throw new Error(errorData.message || "Failed to initiate attendance.");
        }

        const responseData = await response.json();
        if (responseData.success && responseData.data && responseData.data.attendanceCode) {
            displayAlert(`Attendance initiated successfully! Your attendance code is <strong>${responseData.data.attendanceCode}</strong>.`, "success");
        } else {
            throw new Error("Attendance code not found in response.");
        }
    } catch (error) {
        console.error("Error initiating attendance:", error);
        displayAlert("Error initiating attendance. Please try again.", "danger");
    }
});

    // Display alert with a dismiss button
    function displayAlert(message, type) {
        // Hide the form
        initiateAttendanceForm.classList.add("d-none");
        formTitle.classList.add("d-none");

        // Display the alert
        responseAlert.className = `alert alert-${type} mt-4 text-center`;
        responseAlert.innerHTML = `
            <h2>${message}</h2>
            <button type="button" class="btn btn-secondary btn-lg mt-3" id="dismissButton">Dismiss</button>
        `;
        responseAlert.classList.remove("d-none");
        // Add dismiss functionality
        const dismissButton = document.getElementById("dismissButton");
        dismissButton.addEventListener("click", () => {
            responseAlert.classList.add("d-none");
        });
    }

    // Fetch and populate locations on page load
    fetchLocations();
});


