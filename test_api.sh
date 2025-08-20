#!/bin/bash

# Script para testar a API NFS-e

BASE_URL="http://localhost:8080"
TOKEN="5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7"

echo "=== Testando API NFS-e ==="

# 1. Health Check
echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq .
echo -e "\n"

# 2. Consultar NFS-e por número (deve retornar erro pois não há dados)
echo "2. Consultar NFS-e por número:"
curl -s -H "Authorization: $TOKEN" \
  "$BASE_URL/api/v1/nfse/consultar?NumeroNfse=12345" | jq .
echo -e "\n"

# 3. Consultar NFS-e por RPS (deve retornar erro pois não há dados)
echo "3. Consultar NFS-e por RPS:"
curl -s -H "Authorization: $TOKEN" \
  "$BASE_URL/api/v1/nfse/consultar?NumeroRps=67890" | jq .
echo -e "\n"

# 4. Consultar XMLs por intervalo de números
echo "4. Consultar XMLs por intervalo:"
curl -s -H "Authorization: $TOKEN" \
  "$BASE_URL/api/v1/nfse/xmlnfse?nr_inicial=100&nr_final=200" | jq .
echo -e "\n"

# 5. Último RPS enviado
echo "5. Último RPS enviado:"
curl -s -H "Authorization: $TOKEN" \
  "$BASE_URL/api/v1/nfse/ultimorpsenviado" | jq .
echo -e "\n"

# 6. Teste sem token (deve retornar erro 401)
echo "6. Teste sem token (deve retornar 401):"
curl -s "$BASE_URL/api/v1/nfse/consultar?NumeroNfse=12345" | jq .
echo -e "\n"

echo "=== Testes concluídos ==="
