let clients = [];
let selectedStatus = "All";
let selectedClientId = null;

const clientsList = document.getElementById("clientsList");
const clientsLoading = document.getElementById("clientsLoading");
const clientsError = document.getElementById("clientsError");
const clientsEmpty = document.getElementById("clientsEmpty");

const clientSearch = document.getElementById("clientSearch");
const clientSort = document.getElementById("clientSort");
const statusFilters = document.getElementById("statusFilters");
const retryClientsButton = document.getElementById("retryClientsButton");

const addClientModal = document.getElementById("addClientModal");
const openAddClientButton = document.getElementById("openAddClientButton");
const closeAddClientButton = document.getElementById("closeAddClientButton");
const cancelAddClientButton = document.getElementById("cancelAddClientButton");
const addClientForm = document.getElementById("addClientForm");

const clientDetailsModal = document.getElementById("clientDetailsModal");
const closeClientDetailsButton = document.getElementById(
    "closeClientDetailsButton"
);
const clientDetailsContent = document.getElementById(
    "clientDetailsContent"
);

const noteForm = document.getElementById("noteForm");
const noteText = document.getElementById("noteText");
const noteError = document.getElementById("noteError");
const notesList = document.getElementById("notesList");
const reminderButton = document.getElementById("reminderButton");

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function isValidClientEmail(email) {
    const atIndex = email.indexOf("@");
    const dotIndex = email.lastIndexOf(".");

    return (
        atIndex > 0 &&
        dotIndex > atIndex + 1 &&
        dotIndex < email.length - 1
    );
}

function showLoadingState() {
    clientsLoading.classList.remove("hidden");
    clientsError.classList.add("hidden");
    clientsEmpty.classList.add("hidden");
    clientsList.innerHTML = "";
}

function showErrorState() {
    clientsLoading.classList.add("hidden");
    clientsError.classList.remove("hidden");
    clientsEmpty.classList.add("hidden");
    clientsList.innerHTML = "";
}

function hideStateMessages() {
    clientsLoading.classList.add("hidden");
    clientsError.classList.add("hidden");
    clientsEmpty.classList.add("hidden");
}

function getVisibleClients() {
    const searchTerm = clientSearch.value
        .trim()
        .toLowerCase();

    let visibleClients = [...clients];

    if (selectedStatus !== "All") {
        visibleClients = visibleClients.filter(function (client) {
            return client.status === selectedStatus;
        });
    }

    if (searchTerm !== "") {
        visibleClients = visibleClients.filter(function (client) {
            const name = String(client.name || "").toLowerCase();
            const company = String(client.company || "").toLowerCase();

            return (
                name.includes(searchTerm) ||
                company.includes(searchTerm)
            );
        });
    }

    const sortValue = clientSort.value;

    if (sortValue === "name") {
        visibleClients.sort(function (firstClient, secondClient) {
            return firstClient.name.localeCompare(secondClient.name);
        });
    }

    if (sortValue === "dealValue") {
        visibleClients.sort(function (firstClient, secondClient) {
            return secondClient.dealValue - firstClient.dealValue;
        });
    }

    if (sortValue === "newest") {
        visibleClients.sort(function (firstClient, secondClient) {
            return (
                new Date(secondClient.createdAt) -
                new Date(firstClient.createdAt)
            );
        });
    }

    return visibleClients;
}

function createStatusOptions(currentStatus) {
    const statuses = [
        "Lead",
        "Contacted",
        "Won",
        "Lost"
    ];

    return statuses
        .map(function (status) {
            const selected =
                status === currentStatus ? "selected" : "";

            return `
                <option value="${status}" ${selected}>
                    ${status}
                </option>
            `;
        })
        .join("");
}

function renderClients() {
    const visibleClients = getVisibleClients();

    hideStateMessages();
    clientsList.innerHTML = "";

    if (visibleClients.length === 0) {
        clientsEmpty.classList.remove("hidden");
        return;
    }

    visibleClients.forEach(function (client) {
        const card = document.createElement("article");

        card.className = "client-card";
        card.dataset.clientId = client.id;

        const safeName = escapeHtml(client.name);
        const safeCompany = escapeHtml(
            client.company || "No company"
        );
        const safeEmail = escapeHtml(client.email);
        const safeImage = escapeHtml(
            client.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    client.name
                )}`
        );

        card.innerHTML = `
            <div class="client-card-header">
                <img
                    class="client-avatar"
                    src="${safeImage}"
                    alt="${safeName}"
                >

                <div>
                    <h2 class="client-name">
                        ${safeName}
                    </h2>

                    <p class="client-company">
                        ${safeCompany}
                    </p>
                </div>
            </div>

            <div class="client-information">
                <p>
                    <strong>Email:</strong>
                    ${safeEmail}
                </p>

                <p>
                    <strong>Deal value:</strong>
                    ${formatMoney(client.dealValue)}
                </p>

                <span class="status-badge status-${client.status.toLowerCase()}">
                    ${client.status}
                </span>
            </div>

            <div class="client-card-actions">
                <select
                    class="client-status-select"
                    data-client-id="${client.id}"
                    aria-label="Change client status"
                >
                    ${createStatusOptions(client.status)}
                </select>

                <button
                    class="delete-client-button"
                    type="button"
                    data-client-id="${client.id}"
                >
                    Delete
                </button>
            </div>
        `;

        clientsList.appendChild(card);
    });
}

async function initializeClients() {
    showLoadingState();

    try {
        clients = await loadClients();
        renderClients();
    } catch (error) {
        console.error(error);
        showErrorState();
    }
}

function openAddClientModal() {
    addClientModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeAddClientModal() {
    addClientModal.classList.add("hidden");
    document.body.style.overflow = "";
    addClientForm.reset();
    clearAddClientErrors();
}

function clearAddClientErrors() {
    document.getElementById("clientNameError").textContent = "";
    document.getElementById("clientEmailError").textContent = "";
    document.getElementById("clientPhoneError").textContent = "";
    document.getElementById("clientCompanyError").textContent = "";
    document.getElementById("clientDealValueError").textContent = "";
    document.getElementById("clientStatusError").textContent = "";
}

function validateAddClientForm(clientData) {
    clearAddClientErrors();

    let isValid = true;

    if (clientData.name.length < 3) {
        document.getElementById(
            "clientNameError"
        ).textContent =
            "Name must be at least 3 characters";

        isValid = false;
    }

    if (!isValidClientEmail(clientData.email)) {
        document.getElementById(
            "clientEmailError"
        ).textContent =
            "Please enter a valid email address";

        isValid = false;
    }

    const emailExists = clients.some(function (client) {
        return (
            client.email.toLowerCase() ===
            clientData.email.toLowerCase()
        );
    });

    if (emailExists) {
        document.getElementById(
            "clientEmailError"
        ).textContent =
            "A client with this email already exists";

        isValid = false;
    }

    const phoneDigits = clientData.phone.replace(/\D/g, "");

    if (phoneDigits.length < 7) {
        document.getElementById(
            "clientPhoneError"
        ).textContent =
            "Phone number looks too short";

        isValid = false;
    }

    if (
        Number.isNaN(clientData.dealValue) ||
        clientData.dealValue <= 0
    ) {
        document.getElementById(
            "clientDealValueError"
        ).textContent =
            "Deal value must be a positive number";

        isValid = false;
    }

    return isValid;
}

async function handleAddClient(event) {
    event.preventDefault();

    const clientData = {
        name: document
            .getElementById("clientName")
            .value.trim(),

        email: document
            .getElementById("clientEmail")
            .value.trim()
            .toLowerCase(),

        phone: document
            .getElementById("clientPhone")
            .value.trim(),

        company: document
            .getElementById("clientCompany")
            .value.trim(),

        dealValue: Number(
            document.getElementById("clientDealValue").value
        ),

        status: document.getElementById("clientStatus").value
    };

    if (!validateAddClientForm(clientData)) {
        return;
    }

    const submitButton = addClientForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Adding...";

    try {
        const response = await fetch(
            "https://dummyjson.com/users/add",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName: clientData.name,
                    email: clientData.email,
                    phone: clientData.phone
                })
            }
        );

        if (!response.ok) {
            throw new Error("Could not add client");
        }

        await response.json();

        const newClient = {
            id: Date.now(),
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            company: clientData.company || "No company",
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                clientData.name
            )}`,
            status: clientData.status,
            dealValue: clientData.dealValue,
            notes: [],
            createdAt: new Date().toISOString()
        };

        clients.unshift(newClient);
        saveClients(clients);
        renderClients();
        closeAddClientModal();

        showToast("Client added ✓", "success");
    } catch (error) {
        console.error(error);

        showToast(
            "Could not add client. Please try again.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Add Client";
    }
}

async function deleteClient(clientId) {
    const confirmed = confirm(
        "Delete this client? This cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://dummyjson.com/users/${clientId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok && response.status !== 404) {
            throw new Error("Could not delete client");
        }
    } catch (error) {
        console.warn(
            "API delete failed. Removing client locally.",
            error
        );
    }

    clients = clients.filter(function (client) {
        return String(client.id) !== String(clientId);
    });

    saveClients(clients);
    renderClients();

    showToast("Client deleted", "success");
}

function updateClientStatus(clientId, newStatus) {
    const client = clients.find(function (item) {
        return String(item.id) === String(clientId);
    });

    if (!client) {
        return;
    }

    client.status = newStatus;

    saveClients(clients);
    renderClients();

    showToast("Client status updated ✓", "success");
}

function openClientDetails(clientId) {
    selectedClientId = clientId;

    const client = clients.find(function (item) {
        return String(item.id) === String(clientId);
    });

    if (!client) {
        return;
    }

    const safeName = escapeHtml(client.name);
    const safeImage = escapeHtml(client.image || "");
    const safeCompany = escapeHtml(client.company || "No company");
    const safeEmail = escapeHtml(client.email);
    const safePhone = escapeHtml(client.phone || "No phone");

    clientDetailsContent.innerHTML = `
        <div class="client-details-header">
            <img
                class="client-details-avatar"
                src="${safeImage}"
                alt="${safeName}"
            >

            <div>
                <h2>${safeName}</h2>
                <p>${safeCompany}</p>
            </div>
        </div>

        <div class="client-details-list">
            <p>
                <strong>Email:</strong>
                ${safeEmail}
            </p>

            <p>
                <strong>Phone:</strong>
                ${safePhone}
            </p>

            <p>
                <strong>Status:</strong>
                ${client.status}
            </p>

            <p>
                <strong>Deal value:</strong>
                ${formatMoney(client.dealValue)}
            </p>

            <p>
                <strong>Client since:</strong>
                ${formatDate(client.createdAt)}
            </p>
        </div>
    `;

    renderNotes(client);

    clientDetailsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeClientDetailsModal() {
    clientDetailsModal.classList.add("hidden");
    document.body.style.overflow = "";
    selectedClientId = null;
    noteForm.reset();
    noteError.textContent = "";
}

function renderNotes(client) {
    notesList.innerHTML = "";

    if (!Array.isArray(client.notes) || client.notes.length === 0) {
        notesList.innerHTML = `
            <p class="state-message">
                No notes yet.
            </p>
        `;

        return;
    }

    [...client.notes]
        .reverse()
        .forEach(function (note) {
            const noteElement = document.createElement("div");

            noteElement.className = "note-item";

            noteElement.innerHTML = `
                <p>${escapeHtml(note.text)}</p>
                <small>${escapeHtml(note.date)}</small>
            `;

            notesList.appendChild(noteElement);
        });
}

function handleAddNote(event) {
    event.preventDefault();

    const text = noteText.value.trim();

    noteError.textContent = "";

    if (text === "") {
        noteError.textContent = "Note cannot be empty";
        return;
    }

    const client = clients.find(function (item) {
        return String(item.id) === String(selectedClientId);
    });

    if (!client) {
        return;
    }

    if (!Array.isArray(client.notes)) {
        client.notes = [];
    }

    client.notes.push({
        text: text,
        date: new Date().toLocaleString()
    });

    saveClients(clients);
    renderNotes(client);
    noteForm.reset();

    showToast("Note added ✓", "success");
}

function setClientReminder() {
    const client = clients.find(function (item) {
        return String(item.id) === String(selectedClientId);
    });

    if (!client) {
        return;
    }

    const clientName = client.name;

    showToast("Reminder set ✓", "success");

    setTimeout(function () {
        showToast(
            `⏰ Follow up: ${clientName}`,
            "success"
        );
    }, 60000);
}

clientSearch.addEventListener("input", renderClients);
clientSort.addEventListener("change", renderClients);

statusFilters.addEventListener("click", function (event) {
    const button = event.target.closest(".filter-button");

    if (!button) {
        return;
    }

    selectedStatus = button.dataset.status;

    document
        .querySelectorAll(".filter-button")
        .forEach(function (filterButton) {
            filterButton.classList.remove("active");
        });

    button.classList.add("active");

    renderClients();
});

clientsList.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(
        ".delete-client-button"
    );

    if (deleteButton) {
        event.stopPropagation();

        deleteClient(deleteButton.dataset.clientId);
        return;
    }

    const statusSelect = event.target.closest(
        ".client-status-select"
    );

    if (statusSelect) {
        return;
    }

    const card = event.target.closest(".client-card");

    if (card) {
        openClientDetails(card.dataset.clientId);
    }
});

clientsList.addEventListener("change", function (event) {
    const statusSelect = event.target.closest(
        ".client-status-select"
    );

    if (!statusSelect) {
        return;
    }

    updateClientStatus(
        statusSelect.dataset.clientId,
        statusSelect.value
    );
});

openAddClientButton.addEventListener(
    "click",
    openAddClientModal
);

closeAddClientButton.addEventListener(
    "click",
    closeAddClientModal
);

cancelAddClientButton.addEventListener(
    "click",
    closeAddClientModal
);

addClientForm.addEventListener(
    "submit",
    handleAddClient
);

closeClientDetailsButton.addEventListener(
    "click",
    closeClientDetailsModal
);

noteForm.addEventListener("submit", handleAddNote);
reminderButton.addEventListener("click", setClientReminder);

retryClientsButton.addEventListener(
    "click",
    initializeClients
);

document
    .querySelectorAll(".modal-overlay")
    .forEach(function (overlay) {
        overlay.addEventListener("click", function () {
            closeAddClientModal();
            closeClientDetailsModal();
        });
    });

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeAddClientModal();
        closeClientDetailsModal();
    }
});

initializeClients();