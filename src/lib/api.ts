
// axiosConfig.js
import axios from 'axios';

// Configurações comuns para todas as instâncias

// Configurações para o ambiente de produção
const productionConfig = axios.create({
  baseURL: 'https://my-habits-two.vercel.app/api', // Insira a URL da API de produção
});

// Configurações para o ambiente de desenvolvimento
const developmentConfig = axios.create({
  baseURL: 'http://localhost:3000/api', // Insira a URL da API de desenvolvimento
});

'developer'

// Exporta a instância correta dependendo do ambiente
export const api = process.env.NEXT_PUBLIC_NODE_ENV_API === 'production' ? productionConfig: developmentConfig;


