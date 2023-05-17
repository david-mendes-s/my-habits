import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://my-habits-8sr0qresf-david-mendes-s.vercel.app/api',
    validateStatus: (status: number) => status >= 200 && status < 300,
});