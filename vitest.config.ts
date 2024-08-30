import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    // Aqui você pode adicionar configurações adicionais para o Vitest
    globals: true, // Ativa o uso de variáveis globais no Vitest, se necessário
    environment: 'node', // Define o ambiente de teste como Node.js
  },
})
