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

// Create a new event (basic fields only). Schedule handling & advanced relations TBD.
// (Deprecated basic CreateEvent removed; use CreateEventFull for all new event creation needs)

// Full event creation with optional image file (Blob/File) and schedules array
// payload: { name, description, infoLink, whenStart(Date), whenEnd(Date), isNational, isOnline, isSpot, positionId?, imageFile?, schedules?: [{ name/title, description, whenStart, whenEnd, maxExternalGuests, price, infoLink, isSubscriptable }] }
export const CreateEventFull = async (payload) => {
    if (!pb.authStore?.record?.id) throw new Error('Not authenticated');
    const base = {
        name: payload.name,
        description: payload.description || '',
        info_link: payload.infoLink || '',
        when_start: payload.whenStart instanceof Date ? payload.whenStart.toISOString() : payload.whenStart,
        when_end: payload.whenEnd instanceof Date ? payload.whenEnd.toISOString() : payload.whenEnd,
        is_national: !!payload.isNational,
        is_spot: !!payload.isSpot,
        is_online: !!payload.isOnline,
        owner: pb.authStore.record.id,
    };
    if (!payload.isOnline && payload.positionId) base.position = payload.positionId;

    let createdEvent;
    try {
        if (payload.imageFile) {
            const formData = new FormData();
            for (const k in base) formData.append(k, base[k]);
            formData.append('image', payload.imageFile, payload.imageFile.name || 'cover.jpg');
            createdEvent = await pb.collection('events').create(formData);
        } else {
            createdEvent = await pb.collection('events').create(base);
        }
    } catch (e) {
        throw new Error(e?.message || 'Event creation failed');
    }

    const schedules = Array.isArray(payload.schedules) ? payload.schedules : [];
    for (const sch of schedules) {
        try {
            await pb.collection('events_schedule').create({
                title: sch.name || sch.title || '',
                description: sch.description || '',
                when_start: sch.whenStart instanceof Date ? sch.whenStart.toISOString() : sch.whenStart,
                when_end: sch.whenEnd instanceof Date ? sch.whenEnd.toISOString() : sch.whenEnd,
                max_external_guests: sch.maxExternalGuests ?? null,
                price: sch.price ?? null,
                info_link: sch.infoLink || '',
                is_subscriptable: !!sch.isSubscriptable,
                event: createdEvent.id,
            });
        } catch (e) {
            // Optionally log; we continue creating remaining schedules
            console.warn('Schedule create failed', e);
        }
    }
    return createdEvent;
};

// Create a new position (location) record
// Backend expects: name, address, lat, lon, saved (bool), created_by (user id)
// We accept payload with { name, lat, lng, address }
export const CreatePosition = async (payload) => {
    if (!pb.authStore?.record?.id) throw new Error('Non autenticato');
    const data = {
        name: payload.name,
        address: payload.address || '',
        lat: payload.lat,
        lon: payload.lng, // map local lng -> backend lon
        saved: true,
        created_by: pb.authStore.record.id,
    };
    try {
        const record = await pb.collection('positions').create(data);
        return record;
    } catch (e) {
        throw e;
    }
}

// Fetch saved positions (locations). We only return those flagged as saved=true.
export const GetPositions = async () => {
    return await pb.collection('positions').getFullList({
        filter: 'saved = true',
        sort: '-created'
    }).then(res => res);
}

// Soft delete a position by toggling saved=false
export const DeletePosition = async (id) => {
    if (!id) throw new Error('Id mancante');
    return await pb.collection('positions').update(id, { saved: false });
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
            sort: "name",
        }
    ).then(response => response)
}

// Fetch list of local offices. Collection assumed 'local_offices'.
// Returns raw PocketBase records; normalization is handled in the offices store.
export const GetLocalOffices = async () => {
    return await pb.collection('local_offices').getFullList({
        sort: 'name'
    }).then(res => res)
}

// Local office admins (officer + co-officers) helpers
// Each record in collection 'local_offices_admins' has fields:
// local_office (relation -> local_offices), user (relation -> members_registry), is_the_officer (bool)
// We expand user to include lightweight profile data.
export const GetLocalOfficeAdmins = async (officeId) => {
    if (!officeId) return [];
    return await pb.collection('local_offices_admins').getFullList({
        filter: `local_office = "${officeId}"`,
        expand: 'user',
        sort: '-created'
    }).then(res => res)
}

export const AddLocalOfficeCoOfficer = async (officeId, userId) => {
    if (!officeId || !userId) throw new Error('Missing officeId or userId');
    return await pb.collection('local_offices_admins').create({
        local_office: officeId,
        user: userId,
        is_the_officer: false,
    });
}

export const RemoveLocalOfficeAdmin = async (adminRecordId) => {
    if (!adminRecordId) throw new Error('Missing admin record id');
    return await pb.collection('local_offices_admins').delete(adminRecordId);
}

// Utility: find member by exact email (returns first match or null)
export const FindMemberByEmail = async (email) => {
    if (!email) return null;
    try {
        const res = await pb.collection('members_registry').getList(1,1, { filter: `email = "${email}"` });
        return res?.items?.[0] || null;
    } catch (_) {
        return null;
    }
}

// Fetch a member by its id (returns null if not found or on error)
export const GetMemberById = async (id) => {
    if (!id) return null;
    try {
        return await pb.collection('members_registry').getOne(id);
    } catch (_) {
        return null;
    }
}
