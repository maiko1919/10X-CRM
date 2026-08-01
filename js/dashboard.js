const welcomeMessage =
    document.getElementById("welcomeMessage");

const liveClock =
    document.getElementById("liveClock");

const totalClientsElement =
    document.getElementById("totalClients");

const activeDealsElement =
    document.getElementById("activeDeals");

const wonRevenueElement =
    document.getElementById("wonRevenue");

const newThisWeekElement =
    document.getElementById("newThisWeek");

const leadCountElement =
    document.getElementById("leadCount");

const contactedCountElement =
    document.getElementById("contactedCount");

const wonCountElement =
    document.getElementById("wonCount");

const lostCountElement =
    document.getElementById("lostCount");

const recentClientsElement =
    document.getElementById("recentClients");

function getCurrentUser() {
    const session =
        getStorageItem(STORAGE_KEYS.SESSION);

    const users =
        getStorageItem(STORAGE_KEYS.USERS) || [];

    if (!session) {
        return null;
    }

    return users.find(function (user) {
        return user.id === session.userId;
    });
}

function showWelcomeMessage() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        welcomeMessage.textContent =
            "Welcome back!";

        return;
    }

    const firstName =
        currentUser.fullName.split(" ")[0];

    welcomeMessage.textContent =
        `Welcome back, ${firstName}!`;
}

function updateClock() {
    const now = new Date();

    liveClock.textContent =
        now.toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}

function formatDashboardMoney(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}

function calculateStatistics(clients) {
    const totalClients = clients.length;

    const activeDeals =
        clients.filter(function (client) {
            return (
                client.status !== "Won" &&
                client.status !== "Lost"
            );
        }).length;

    const wonRevenue =
        clients
            .filter(function (client) {
                return client.status === "Won";
            })
            .reduce(function (total, client) {
                return (
                    total +
                    Number(client.dealValue || 0)
                );
            }, 0);

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );

    const newThisWeek =
        clients.filter(function (client) {
            return (
                new Date(client.createdAt) >=
                sevenDaysAgo
            );
        }).length;

    const leadCount =
        clients.filter(function (client) {
            return client.status === "Lead";
        }).length;

    const contactedCount =
        clients.filter(function (client) {
            return client.status === "Contacted";
        }).length;

    const wonCount =
        clients.filter(function (client) {
            return client.status === "Won";
        }).length;

    const lostCount =
        clients.filter(function (client) {
            return client.status === "Lost";
        }).length;

    totalClientsElement.textContent =
        totalClients;

    activeDealsElement.textContent =
        activeDeals;

    wonRevenueElement.textContent =
        formatDashboardMoney(wonRevenue);

    newThisWeekElement.textContent =
        newThisWeek;

    leadCountElement.textContent =
        leadCount;

    contactedCountElement.textContent =
        contactedCount;

    wonCountElement.textContent =
        wonCount;

    lostCountElement.textContent =
        lostCount;
}

function renderRecentClients(clients) {
    recentClientsElement.innerHTML = "";

    if (clients.length === 0) {
        recentClientsElement.innerHTML =
            "<p>No clients found.</p>";

        return;
    }

    const recentClients =
        [...clients]
            .sort(function (
                firstClient,
                secondClient
            ) {
                return (
                    new Date(
                        secondClient.createdAt
                    ) -
                    new Date(
                        firstClient.createdAt
                    )
                );
            })
            .slice(0, 5);

    recentClients.forEach(function (client) {
        const clientElement =
            document.createElement("div");

        clientElement.className =
            "recent-client-item";

        clientElement.innerHTML = `
            <div>
                <strong>${client.name}</strong>

                <p>
                    ${client.company || "No company"}
                </p>
            </div>

            <span
                class="status-badge status-${client.status.toLowerCase()}"
            >
                ${client.status}
            </span>
        `;

        recentClientsElement.appendChild(
            clientElement
        );
    });
}

async function initializeDashboard() {
    showWelcomeMessage();
    updateClock();

    setInterval(updateClock, 1000);

    try {
        const clients =
            await loadClients();

        calculateStatistics(clients);
        renderRecentClients(clients);
    } catch (error) {
        console.error(error);

        recentClientsElement.innerHTML =
            "<p>Could not load dashboard data.</p>";
    }
}

initializeDashboard();