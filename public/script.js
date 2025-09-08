document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("feedbackForm");
    const studentIdentifierInput = document.getElementById("studentIdentifier");
    const cohortSelect = document.getElementById("cohort");
    const weekSelect = document.getElementById("week");
    const resultDiv = document.getElementById("result");

    // Dynamically populate the week dropdown
    for (let i = 1; i <= 16; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `Week ${i}`;
        weekSelect.appendChild(option);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const studentIdentifier = studentIdentifierInput.value.trim();
        const cohort = cohortSelect.value;
        const week = parseInt(weekSelect.value);

        // Hide previous result and clear content
        resultDiv.classList.add("hidden");
        resultDiv.innerHTML = '';

        if (!studentIdentifier || !cohort || isNaN(week)) {
            displayMessage("Please enter your name or student number, and select a valid cohort and week.", "error");
            return;
        }

        // ⚠️ THIS IS THE KEY CHANGE ⚠️
        // The URL now points to your proxy server, which will handle the request to the secret URL.
        const url = `/api/feedback?cohort=${encodeURIComponent(cohort)}&studentIdentifier=${encodeURIComponent(studentIdentifier)}&week=${encodeURIComponent(week)}`;

        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Server response was not ok.');
                }
                return res.json();
            })
            .then((data) => {
                const isNumber = /^\d+$/.test(studentIdentifier);
                const identifierValue = isNumber ? studentIdentifier.toString() : studentIdentifier.toLowerCase();

                const match = data.find((f) => {
                    const studentDataIdentifier = isNumber ? f["Student Number"].toString() : f["Student Name"].toLowerCase();
                    return f["Week Number"] == week && studentDataIdentifier === identifierValue;
                });
                
                if (match) {
                    const teamLead = match["Team Lead"];
                    const careerCoach = match["Career Coach"];
                    displayFeedback(match["Student Name"], week, teamLead, careerCoach, match["Feedback/Comment"]);
                } else {
                    displayMessage("No feedback found for this student in the selected week and cohort.", "info");
                }
            })
            .catch((err) => {
                console.error(err);
                displayMessage("Error fetching data. Please try again.", "error");
            });
    });

    /**
     * Helper function to display the structured feedback.
     */
    function displayFeedback(studentName, week, teamLead, careerCoach, feedbackContent) {
        resultDiv.innerHTML = `
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md animate-fadeIn">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
                    <div class="flex-1 space-y-1">
                        <p class="font-bold text-lg text-gray-800">${studentName}</p>
                        <p class="text-blue-600 font-semibold">Week ${week} Self-Evaluation</p>
                    </div>
                    <div class="flex-1 text-center hidden md:block">
                        <p class="font-medium text-gray-500">Team Lead</p>
                        <p class="font-semibold text-gray-800">${teamLead}</p>
                    </div>
                    <div class="flex-1 text-right">
                        <p class="font-medium text-gray-500">Career Coach</p>
                        <p class="font-semibold text-gray-800">${careerCoach}</p>
                    </div>
                </div>

                <div class="space-y-4 text-gray-800">
                    <p class="font-semibold text-lg text-blue-700">Feedback</p>
                    <p class="leading-relaxed">${feedbackContent}</p>
                </div>
            </div>
        `;
        resultDiv.classList.remove("hidden");
    }

    /**
     * Helper function to display error or info messages.
     */
    function displayMessage(message, type) {
        let bgColor = '';
        let borderColor = '';
        let textColor = '';

        if (type === "error") {
            bgColor = 'bg-red-50';
            borderColor = 'border-red-400';
            textColor = 'text-red-700';
        } else {
            bgColor = 'bg-blue-50';
            borderColor = 'border-blue-400';
            textColor = 'text-blue-700';
        }

        resultDiv.innerHTML = `
            <div class="${bgColor} border-l-4 ${borderColor} rounded-md p-4 animate-fadeIn">
                <p class="text-sm ${textColor}">${message}</p>
            </div>
        `;
        resultDiv.classList.remove("hidden");
    }
});