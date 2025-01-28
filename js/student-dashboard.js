document.addEventListener("DOMContentLoaded", () => {
    const greetingMessage = document.getElementById("greeting"); 
    
    // Display greeting message
     function displayGreeting() {
        const user = JSON.parse(localStorage.getItem("user")); // Retrieve user data from localStorage
        if (user && user.name) {
            greetingMessage.textContent = `Hi, ${user.name}`; // Set the greeting text
        } else {
            greetingMessage.textContent = "Hi, User"; // Fallback if no user data
        }
    }

    displayGreeting();
});

document.addEventListener("DOMContentLoaded", () => {
    const attendanceList = document.getElementById("attendanceList"); // Target the UL or container element

    // Retrieve the logged-in student info from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if the user is logged in and is a student
    if (!user || user.role !== "STUDENT") {
        alert("You must be logged in as a student to view your attendance history.");
        window.location.href = "/IsignApp/login.html"; // Redirect to login page
        return;
    }

    const studentId = user.id; // Get the student's ID

    // Fetch attendance history
    async function fetchAttendanceHistory() {
        try {
            const response = await fetch(`http://localhost:8080/api/attendance/history/${studentId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch attendance history.");
            }

            const attendanceData = await response.json();
            console.log("Attendance history:", attendanceData); // Debugging log
            renderAttendanceHistory(attendanceData);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
            attendanceList.innerHTML = `<li class="list-group-item text-danger">Error loading attendance history.</li>`;
        }
    }

    // Render the attendance history dynamically
    function renderAttendanceHistory(data) {
        if (!Array.isArray(data) || data.length === 0) {
            attendanceList.innerHTML = `<li class="list-group-item">No attendance history found.</li>`;
            return;
        }

        data.forEach(record => {
            const attendanceDate = new Date(record.attendanceTime).toLocaleDateString(); // Format date
            const attendanceTime = new Date(record.attendanceTime).toLocaleTimeString(); // Format time

            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";

            listItem.innerHTML = `
                <h5>${record.courseTitle}</h5>
                <h5>${attendanceDate}</h5>
                <h5>${attendanceTime}</h5>
            `;

            attendanceList.appendChild(listItem);
        });
    }

    // Fetch and render attendance history on page load
    fetchAttendanceHistory();
});
document.addEventListener("DOMContentLoaded", () => {
    const verifyForm = document.getElementById("verifyForm");
    const attendanceCodeInput = document.getElementById("attendanceCode");
    const responseContainer = document.getElementById("responseContainer");
    const markAttendanceButton = document.getElementById("markAttendanceButton");

    let sessionId = null; // To store the sessionId for the next step
    let courseTitle = ""; // To display in the success message

    // Retrieve the logged-in student info from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "STUDENT") {
        alert("You must be logged in as a student to mark attendance.");
        window.location.href = "/IsignApp/login.html"; // Redirect to login page
        return;
    }

    const studentId = user.id; // Get the student's ID

    // Verify the attendance code
    verifyForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission

        const attendanceCode = attendanceCodeInput.value.trim();

        if (!attendanceCode) {
            alert("Please enter the attendance code.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/attendance/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    attendanceCode,
                    studentId
                })
            });

            if (!response.ok) {
                throw new Error("Failed to verify attendance code.");
            }

            const data = await response.json();

            if (data.success) {
                // Store session details for the next step
                sessionId = data.sessionId;
                courseTitle = data.courseTitle;

                // Display success message and show "Mark Attendance" button
                responseContainer.innerHTML = `
                    <div class="alert alert-success">
                        You can now proceed to mark attendance for <strong>${courseTitle}</strong>.
                    </div>
                `;
                markAttendanceButton.classList.remove("d-none"); // Show the button
            } else {
                responseContainer.innerHTML = `
                    <div class="alert alert-danger">${data.message}</div>
                `;
            }
        } catch (error) {
            console.error("Error verifying attendance code:", error);
            responseContainer.innerHTML = `
                <div class="alert alert-danger">Error verifying attendance code. Please try again.</div>
            `;
        }
    });

    // Mark attendance
    markAttendanceButton.addEventListener("click", async () => {
        if (!sessionId) {
            alert("Session ID is missing. Please verify the attendance code first.");
            return;
        }

        // Get the student's current coordinates
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords; // Extract coordinates
        
                // Collect the attendance code entered by the user
                const attendanceCodeInput = document.getElementById("attendanceCode");
                const attendanceCode = attendanceCodeInput ? attendanceCodeInput.value.trim() : null;
        
                if (!attendanceCode) {
                    alert("Attendance code is required.");
                    return;
                }
        
                try {
                    const response = await fetch("http://localhost:8080/api/attendance/submit", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            sessionId, // Session ID from the frontend context
                            studentId, // Student ID from logged-in user
                            studentLatitude: latitude, // Geolocation latitude
                            studentLongitude: longitude, // Geolocation longitude
                            attendanceCode // Attendance or failsafe code
                        })
                    });

                    console.log(latitude, longitude);
        
                    if (!response.ok) {
                        throw new Error("Failed to submit attendance.");
                    }
        
                    const responseData = await response.json();
        
                    if (responseData.success) {
                        console.log("Attendance submitted successfully:", responseData.message);
                        alert(responseData.message);
                    } else {
                        console.error("Attendance submission failed:", responseData.message);
                        alert(responseData.message);
                    }
                } catch (error) {
                    console.error("Error submitting attendance:", error);
                    alert("An error occurred while submitting attendance. Please try again.");
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Failed to get your location. Please allow location access and try again.");
            }
        );
        
    });
});




