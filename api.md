# Endpoints API NFS-e Imperatriz-MA

Token usado:
`5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7`

Base URL Produção:
`https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services`

---

## 1. Gerar NFS-e

```bash
curl -X POST "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/gerar" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d @rps.json
```

*(o arquivo `rps.json` deve conter os dados da nota conforme layout do manual).*

---

## 2. Cancelar NFS-e

```bash
curl -X POST "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/cancelar" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d @cancelamento.json
```

---

## 3. Substituir NFS-e

```bash
curl -X POST "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/substituir" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d @substituicao.json
```

---

## 4. Consultar NFS-e

Consultar por número da NFS-e:

```bash
curl -X GET "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/consultar?NumeroNfse=12345" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

Consultar por número do RPS:

```bash
curl -X GET "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/consultar?NumeroRps=67890" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---

## 5. Recuperar número do último RPS enviado

```bash
curl -X GET "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/ultimorpsenviado" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---

## 6. Consultar XML da NFS-e (em massa)

Por intervalo de números:

```bash
curl -X GET "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/xmlnfse?nr_inicial=100&nr_final=200" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

Por intervalo de datas:

```bash
curl -X GET "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/xmlnfse?dt_inicial=2024-08-01&dt_final=2024-08-05&nr_page=1" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

Por competência:

```bash
curl -X GET "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/xmlnfse?nr_competencia=202408" \
  -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---
