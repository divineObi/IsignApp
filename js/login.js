document.addEventListener("DOMContentLoaded", () => {
    // Attach the form submit event listener
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get the regnumber value from the input field
        const regnumber = document.getElementById("regnumber").value.trim();

        if (!regnumber) {
            alert("Please enter your registration number.");
            return;
        }

        try {
            // Send the login request to the backend
            const response = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ regnumber })
            });

            if (!response.ok) {
                // Handle non-200 HTTP responses
                const errorData = await response.json();
                alert(`Login failed: ${errorData.message || "Unknown error"}`);
                return;
            }

            const data = await response.json(); // Parse the JSON response
            localStorage.setItem("user", JSON.stringify(data)); // Store user data in localStorage

            // Redirect based on the role
            if (data.role === "STUDENT") {
                window.location.href = "/IsignApp/student-dashboard.html"; // Student dashboard
            } else if (data.role === "LECTURER") {
                window.location.href = "/IsignApp/lecturer-dashboard.html"; // Lecturer dashboard
            } else {
                alert("Invalid role received from server.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred while trying to log in. Please try again later.");
        }
    });
});
