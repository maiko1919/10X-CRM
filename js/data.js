const CLIENTS_API_URL =
    "https://dummyjson.com/users?limit=30";

function saveClients(clients) {
    setStorageItem(
        STORAGE_KEYS.CLIENTS,
        clients
    );
}

function getSavedClients() {
    return (
        getStorageItem(
            STORAGE_KEYS.CLIENTS
        ) || []
    );
}

function createDealValue() {
    return Math.floor(
        Math.random() * 9501
    ) + 500;
}

function mapApiUsersToClients(users) {
    return users.map(function (user) {
        return {
            id: user.id,

            name:
                `${user.firstName} ${user.lastName}`,

            email: user.email,

            phone: user.phone,

            company:
                user.company &&
                user.company.name
                    ? user.company.name
                    : "No company",

            image: user.image,

            status: "Lead",

            dealValue:
                createDealValue(),

            notes: [],

            createdAt:
                new Date().toISOString()
        };
    });
}

async function fetchClientsFromApi() {
    const response =
        await fetch(CLIENTS_API_URL);

    if (!response.ok) {
        throw new Error(
            "Could not fetch clients"
        );
    }

    const data = await response.json();

    const clients =
        mapApiUsersToClients(data.users);

    saveClients(clients);

    return clients;
}

async function loadClients() {
    const savedClients =
        getStorageItem(
            STORAGE_KEYS.CLIENTS
        );

    if (
        Array.isArray(savedClients) &&
        savedClients.length > 0
    ) {
        return savedClients;
    }

    return await fetchClientsFromApi();
}

async function resetClientsData() {
    removeStorageItem(
        STORAGE_KEYS.CLIENTS
    );

    return await fetchClientsFromApi();
}