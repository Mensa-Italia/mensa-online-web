import PocketBase from 'pocketbase';

const baseURL = 'https://svc.mensa.it';
// Export the singleton PocketBase instance so stores can subscribe to auth changes
export const pb = new PocketBase(baseURL);


function buildFormData(data) {
    const form = new FormData();
    for (const key in data) {
        form.append(key, data[key]);
    }
    return form;
}

export const Login = async (email, password) => {
    try {
        const response = await fetch(`${baseURL}/api/cs/auth-with-area`, {
            method: 'POST',
            body: buildFormData({
                email,
                password,
            }),
        });
        if (!response.ok) {
            // Attempt to parse error body for message
            let message = 'Login failed';
            try {
                const errJson = await response.json();
                message = errJson?.message || errJson?.error || message;
            } catch (_) { /* ignore parse errors */ }
            throw new Error(message);
        }
        const data = await response.json();
        if (data?.token && data?.record) {
            pb.authStore.save(data.token, data.record);
        }
        return data;
    } catch (err) {
        // Ensure auth store cleared on failure
        pb.authStore.clear();
        throw err;
    }
};

export const isLogged = () => {
    return pb.authStore.isValid;
}

export const GetUser = () => {
    return pb.authStore.record;
}

export const FileUrl = (record, firstFilename) => {
    return pb.files.getURL(record, firstFilename);
}

export const Logout = () => {
    pb.authStore.clear();
}

export const GetEvents = async () => {
    const now = new Date();
    const date = now.toISOString();
    return await pb.collection('events').getFullList({
        filter: "(when_end >= '" + date + "' && is_spot = false)",
        sort: "when_start",
        expand: "position"
    }).then(response => {
        
        return response
    })
}

export const GetDocuments = async () => {
    return await pb.collection('documents').getFullList(
        {
            sort: "-created",
        }
    ).then(response => response)
}

export const GetDocumentsElaboration = async (id) => {
    return await pb.collection('documents_elaborated').getOne(id).then(response => response)
}

// Fetch elaboration record by related document id (relation field assumed 'document')
export const GetDocumentElaborationByDocument = async (documentId) => {
    if (!documentId) return null;
    const list = await pb.collection('documents_elaborated').getList(1, 1, {
        filter: `document = '${documentId}'`
    });
    return list?.items?.[0] || null;
}

export const GetUserChart = async () => {
    return await pb.collection('view_chart_daily_users').getFullList().then(response => response)
}

export const GetCommunities = async () => {
    return await pb.collection('sigs').getFullList(
        {
            sort: "name",
        }
    ).then(response => response)
}

export const GetBoutiqueProducts = async () => {
    return await pb.collection('boutique').getFullList(
        {
            sort: "name",
        }
    ).then(response => response)
}


export const GetMembers = async () => {
    return await pb.collection('members_registry').getFullList(
        {
            sort: "-created",
        }
    ).then(response => response)
}
