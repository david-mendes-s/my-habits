
// axiosConfig.js
import axios from 'axios';

// Configurações comuns para todas as instâncias
axios.defaults.validateStatus = (status) => status >= 200 && status < 300;

// Configurações para o ambiente de produção
const productionConfig = axios.create({
  baseURL: 'https://my-habits-alpha.vercel.app/api', // Insira a URL da API de produção
});

// Configurações para o ambiente de desenvolvimento
const developmentConfig = axios.create({
  baseURL: 'http://localhost:3000/api', // Insira a URL da API de desenvolvimento
});

// Exporta a instância correta dependendo do ambiente
export const api = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;


