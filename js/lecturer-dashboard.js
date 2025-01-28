document.addEventListener("DOMContentLoaded", () => {
    const greetingMessage = document.querySelector(".greeting"); 
    const sessionsList = document.getElementById("sessionsList");

    // Display greeting message
     function displayGreeting() {
        const user = JSON.parse(localStorage.getItem("user")); // Retrieve user data from localStorage
        if (user && user.name) {
            greetingMessage.textContent = `Hi, ${user.name}`; // Set the greeting text
        } else {
            greetingMessage.textContent = "Hi, User"; // Fallback if no user data
        }
    }

    if (!sessionsList) {
        console.error("Error: Element with id 'sessionsList' not found in the DOM.");
        return;
    }

    async function fetchSessions() {
        // Retrieve the user data from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
    
        // Check if user data exists and the role is LECTURER
        if (!user || user.role !== "LECTURER") {
            console.error("User not logged in or not a lecturer.");
            alert("You must be logged in as a lecturer to access this page.");
            window.location.href = "/IsignApp/login.html"; // Redirect to login page
            return;
        }
    
        // Extract the lecturerId from the stored user data
        const lecturerId = user.id;
    
        try {
            // Fetch sessions associated with the lecturerId
            const response = await fetch(`http://localhost:8080/api/attendance/sessions?lecturerId=${lecturerId}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch sessions.");
            }
    
            const sessions = await response.json(); // Parse the response
            console.log("Fetched sessions:", sessions); // Debugging log
            // Save sessions in localStorage for later use
            localStorage.setItem("sessions", JSON.stringify(sessions));
            renderSessions(sessions);
        } catch (error) {
            console.error("Error fetching sessions:", error);
            sessionsList.innerHTML = `<li class="list-group-item text-danger">Error fetching sessions.</li>`;
        }
    }
    

    function renderSessions(sessions) {
        if (!Array.isArray(sessions)) {
            console.error("Error: Invalid data format. Expected an array.");
            sessionsList.innerHTML = `<li class="list-group-item text-danger">Invalid data format from server.</li>`;
            return;
        }

        if (sessions.length === 0) {
            sessionsList.innerHTML = `<li class="list-group-item">No sessions found.</li>`;
            return;
        }

        sessionsList.innerHTML = ""; // Clear existing content

        sessions.forEach(session => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";

            const descDiv = document.createElement("div");
            descDiv.className = "desc";

            // Course title with link to session details
            const courseLink = document.createElement("a");
            courseLink.href = `session-details.html?sessionId=${session.id}`;
            courseLink.innerHTML = `<h4>${session.courseTitle}</h4>`;
            descDiv.appendChild(courseLink);

            // Creation date
            const creationDate = document.createElement("p");
            creationDate.className = "fs-6";
            creationDate.textContent = `Created on: ${new Date(session.createdAt).toLocaleString()}`; // Format the date
            descDiv.appendChild(creationDate);

            // Download button
            const downloadButton = document.createElement("button");
            downloadButton.className = "border-0";
            downloadButton.onclick = () => downloadSession(session.sessionId);

            const downloadIcon = document.createElement("img");
            downloadIcon.src = "img/material-symbols_download.png";
            downloadIcon.alt = "Download";
            downloadIcon.className = "img-fluid";
            downloadButton.appendChild(downloadIcon);

            // Add elements to the list item
            listItem.appendChild(descDiv);
            listItem.appendChild(downloadButton);

            // Append the list item to the list
            sessionsList.appendChild(listItem);
        });
    }

    async function downloadSession(sessionId) {
        try {
            const response = await fetch(`http://localhost:8080/api/attendance/session/${sessionId}/download`);
            if (!response.ok) {
                throw new Error("Failed to download session data.");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `attendance_session_${sessionId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading session data:", error);
            alert("Failed to download session data.");
        }
    }
    displayGreeting();
    fetchSessions();
});




