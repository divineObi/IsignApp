document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");

    // Fetch all attendance sessions
    async function fetchHistory() {
        // Retrieve lecturerId from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "LECTURER") {
            console.error("Invalid user or not a lecturer.");
            alert("You must be logged in as a lecturer to view history.");
            return;
        }
        const lecturerId = user.id;
    
        try {
            const response = await fetch(`http://localhost:8080/api/attendance/sessions?lecturerId=${lecturerId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch attendance history.");
            }
            const sessions = await response.json();
            renderHistory(sessions);
        } catch (error) {
            console.error("Error fetching attendance history:", error);
            historyList.innerHTML = `<li class="list-group-item text-danger">Error loading attendance history.</li>`;
        }
    }
    
    

    // Render the attendance history list
    function renderHistory(sessions) {
        if (!Array.isArray(sessions) || sessions.length === 0) {
            historyList.innerHTML = `<li class="list-group-item">No attendance history available.</li>`;
            return;
        }

        sessions.forEach(session => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";

            // Create the description div
            const descDiv = document.createElement("div");
            descDiv.className = "desc";

            // Create the course title link
            const courseLink = document.createElement("a");
            courseLink.href = `session-details.html?sessionId=${session.sessionId}`;
            courseLink.innerHTML = `<h4>${session.courseTitle}</h4>`;
            descDiv.appendChild(courseLink);

            // Creation date
            const creationDate = document.createElement("p");
            creationDate.className = "fs-6";
            creationDate.textContent = `Created on: ${new Date(session.createdAt).toLocaleString()}`; // Format the date
            descDiv.appendChild(creationDate);

            // Create the download button
            const downloadButton = document.createElement("button");
            downloadButton.className = "border-0";
            downloadButton.onclick = () => downloadSession(session.sessionId);

            const downloadIcon = document.createElement("img");
            downloadIcon.src = "img/material-symbols_download.png";
            downloadIcon.alt = "Download";
            downloadIcon.className = "img-fluid";
            downloadButton.appendChild(downloadIcon);

            // Append the description and button to the list item
            listItem.appendChild(descDiv);
            listItem.appendChild(downloadButton);

            // Add the list item to the history list
            historyList.appendChild(listItem);
        });
    }

    // Download session as PDF
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

    // Fetch and render attendance history
    fetchHistory();
});
