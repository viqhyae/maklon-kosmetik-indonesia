import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error?.response?.status === 401
            && error?.response?.headers?.['x-session-expired'] === '1'
            && typeof window !== 'undefined'
        ) {
            window.location.assign('/login');
        }

        return Promise.reject(error);
    },
);
