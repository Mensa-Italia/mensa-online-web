import PocketBase from 'pocketbase';

const baseURL = 'https://svc.mensa.it';
const pb = new PocketBase(baseURL);


function buildFormData(data) {
    const form = new FormData();
    for (const key in data) {
        form.append(key, data[key]);
    }
    return form;
}

export const Login = async (email, password) => {
    return fetch(`${baseURL}/api/cs/auth-with-area`, {
        method: 'POST',
        body: buildFormData(
            {
                "email": email,
                "password": password,
            }
        ),
    }).then(response => response.json())
        .then(data => {
            const token = data.token;
            pb.authStore.save(token, data.record)
            pb.collection('users').getList(1, 50, {}).then(response => {
                console.log(response)
            })

        })
}

export const isLogged = () => {
    return pb.authStore.isValid;
}

export const GetUser = () => {
    return pb.authStore.record;
}

export const ImageUrl = (record, firstFilename) => {
    return pb.files.getURL(record, firstFilename);
}

export const Logout = () => {
    pb.authStore.clear();
}

export const GetEvents = async () => {
    const now = new Date();
    const date = now.toISOString();
    return await pb.collection('events').getFullList({
        filter: "when_end >= '" + date + "'",
        sort: "when_start",
        expand: "position"
    }).then(response => response)
}

export const GetUserChart = async () => {
    return await pb.collection('view_chart_daily_users').getFullList().then(response => response)

}