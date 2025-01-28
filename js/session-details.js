document.addEventListener("DOMContentLoaded", () => {
    const sessionTitle = document.getElementById("sessionTitle");
    const creationDate = document.getElementById("creationDate");
    const attendanceList = document.getElementById("attendanceList");
    const downloadButton = document.querySelector(".attendanceHead button");

    // Get sessionId from the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("sessionId");

    console.log("Full URL:", window.location.href);
    console.log("Query string:", window.location.search);
    console.log("Session ID from URL:", sessionId);

    if (!sessionId) {
        alert("Session ID is missing!");
        return;
    }

    // Get all sessions from localStorage
    const sessions = JSON.parse(localStorage.getItem("sessions"));
    console.log("Sessions from localStorage:", sessions);

    if (!sessions || !Array.isArray(sessions)) {
        console.error("Invalid or missing session data in localStorage.");
        sessionTitle.textContent = "Error loading session title";
        creationDate.textContent = "Created on: Unknown";
        return;
    }

    // Find the current session by sessionId
    const session = sessions.find(s => s.id == sessionId);
    if (!session) {
        console.error(`Session with ID ${sessionId} not found.`);
        sessionTitle.textContent = "Session not found";
        creationDate.textContent = "Created on: Unknown";
        return;
    }

    // Display the session title and creation date
    sessionTitle.textContent = session.courseTitle;
    creationDate.textContent = `Created on: ${
        session.createdAt ? new Date(session.createdAt).toLocaleString() : "Unknown"
    }`;

    // Fetch attendance records for this session
    async function fetchAttendanceRecords() {
        try {
            const response = await fetch(`http://localhost:8080/api/attendance/session/${sessionId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch attendance records.");
            }
            const attendanceRecords = await response.json();
            console.log("Attendance records:", attendanceRecords);
            renderAttendanceRecords(attendanceRecords);
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            attendanceList.innerHTML = `<li class="list-group-item text-danger">Error loading attendance records.</li>`;
        }
    }

    // Render attendance records
    function renderAttendanceRecords(records) {
        if (!Array.isArray(records) || records.length === 0) {
            attendanceList.innerHTML = `<li class="list-group-item">No attendance records found for this session.</li>`;
            return;
        }

        attendanceList.innerHTML = ""; // Clear the list before adding new records
        records.forEach(record => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";

            listItem.innerHTML = `
                <h5>${record.studentName}</h5>
                <h5>${record.regNumber}</h5>
                <h5>${new Date(record.attendanceTime).toLocaleTimeString()}</h5>
            `;

            attendanceList.appendChild(listItem);
        });
    }

    // Download session as PDF
    async function downloadSession() {
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

    // Attach download function to the button
    if (downloadButton) {
        downloadButton.addEventListener("click", downloadSession);
    } else {
        console.error("Download button not found in the DOM.");
    }

    // Fetch and render attendance records
    fetchAttendanceRecords();
});
