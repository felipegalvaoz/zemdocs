package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"unicode/utf8"

	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

func main() {
	fmt.Println("=== TESTE DE ENCODING XML ===")

	// Teste 1: Ler arquivo XML local
	fmt.Println("\n1. TESTANDO ARQUIVO XML LOCAL:")
	testLocalXML()

	// Teste 2: Simular dados da API
	fmt.Println("\n2. TESTANDO SIMULAÇÃO DE DADOS DA API:")
	testAPISimulation()

	// Teste 3: Testar conversões de encoding
	fmt.Println("\n3. TESTANDO CONVERSÕES DE ENCODING:")
	testEncodingConversions()

	// Teste 4: Testar dados reais da API
	fmt.Println("\n4. TESTANDO DADOS REAIS DA API:")
	testRealAPI()
}

func testLocalXML() {
	// Ler o arquivo XML que você tem
	data, err := os.ReadFile("nfse_240000093.xml")
	if err != nil {
		fmt.Printf("Erro ao ler arquivo: %v\n", err)
		return
	}

	content := string(data)
	fmt.Printf("Tamanho do arquivo: %d bytes\n", len(data))
	fmt.Printf("É UTF-8 válido: %v\n", utf8.ValidString(content))

	// Procurar por "PRESTAÇÃO" no arquivo
	if strings.Contains(content, "PRESTAÇÃO") {
		fmt.Println("✅ Encontrou 'PRESTAÇÃO' corretamente")
	} else if strings.Contains(content, "PRESTAÃÃO") {
		fmt.Println("❌ Encontrou 'PRESTAÃÃO' corrompido")
	} else {
		fmt.Println("❓ Não encontrou nenhuma variação de PRESTAÇÃO")
	}

	// Verificar encoding declarado
	if strings.Contains(content, `encoding="UTF-8"`) {
		fmt.Println("📄 XML declara encoding UTF-8")
	} else if strings.Contains(content, `encoding="ISO-8859-1"`) {
		fmt.Println("📄 XML declara encoding ISO-8859-1")
	} else {
		fmt.Println("📄 XML não declara encoding específico")
	}
}

func testAPISimulation() {
	// Simular diferentes cenários de encoding
	scenarios := []struct {
		name string
		text string
	}{
		{"UTF-8 correto", "PRESTAÇÃO DE SERVIÇOS"},
		{"ISO-8859-1 como UTF-8", "PRESTAÃÃO DE SERVIÃOS"},
		{"Double encoding", "PRESTAÃ‡ÃƒO DE SERVIÃ‡OS"},
	}

	for _, scenario := range scenarios {
		fmt.Printf("\nCenário: %s\n", scenario.name)
		fmt.Printf("Texto: %s\n", scenario.text)
		fmt.Printf("É UTF-8 válido: %v\n", utf8.ValidString(scenario.text))
		fmt.Printf("Bytes: %v\n", []byte(scenario.text))
	}
}

func testEncodingConversions() {
	// Texto original em UTF-8
	original := "PRESTAÇÃO DE SERVIÇOS"
	fmt.Printf("Original UTF-8: %s\n", original)
	fmt.Printf("Bytes UTF-8: %v\n", []byte(original))

	// Simular conversão UTF-8 -> ISO-8859-1 -> UTF-8 (double encoding)
	fmt.Println("\nSimulando double encoding:")

	// 1. Converter UTF-8 para ISO-8859-1
	encoder := charmap.ISO8859_1.NewEncoder()
	iso88591Bytes, _, err := transform.Bytes(encoder, []byte(original))
	if err != nil {
		fmt.Printf("Erro na conversão para ISO-8859-1: %v\n", err)
	} else {
		fmt.Printf("ISO-8859-1 bytes: %v\n", iso88591Bytes)

		// 2. Interpretar ISO-8859-1 como UTF-8 (isso causa corrupção)
		corruptedUTF8 := string(iso88591Bytes)
		fmt.Printf("Interpretado como UTF-8: %s\n", corruptedUTF8)
		fmt.Printf("É UTF-8 válido: %v\n", utf8.ValidString(corruptedUTF8))
	}

	// Testar nossa função de correção
	fmt.Println("\nTestando correção:")
	corrupted := "PRESTAÃÃO DE SERVIÃOS"
	fmt.Printf("Corrompido: %s\n", corrupted)

	// Aplicar correções manuais
	fixed := strings.ReplaceAll(corrupted, "Ã", "Ç")
	fixed = strings.ReplaceAll(fixed, "Ã", "Ã")
	fixed = strings.ReplaceAll(fixed, "Ã", "Í")
	fmt.Printf("Corrigido: %s\n", fixed)
}

func testRealAPI() {
	// Fazer uma requisição real para a API
	url := "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br/ws/services/xmlnfse?nr_competencia=202408"

	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("Erro na requisição: %v\n", err)
		return
	}
	defer resp.Body.Close()

	// Ler resposta raw
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Erro ao ler resposta: %v\n", err)
		return
	}

	fmt.Printf("Content-Type: %s\n", resp.Header.Get("Content-Type"))
	fmt.Printf("Content-Length: %d\n", len(bodyBytes))
	fmt.Printf("É UTF-8 válido: %v\n", utf8.ValidString(string(bodyBytes)))

	// Verificar se há BOM UTF-8
	if len(bodyBytes) >= 3 && bodyBytes[0] == 0xEF && bodyBytes[1] == 0xBB && bodyBytes[2] == 0xBF {
		fmt.Println("📄 Resposta tem BOM UTF-8")
		bodyBytes = bodyBytes[3:] // Remover BOM
	}

	bodyString := string(bodyBytes)

	// Procurar por padrões de encoding
	if strings.Contains(bodyString, "PRESTAÇÃO") {
		fmt.Println("✅ API retorna texto correto")
	} else if strings.Contains(bodyString, "PRESTAÃÃO") {
		fmt.Println("❌ API retorna texto corrompido")
	}

	// Verificar encoding declarado no XML
	if strings.Contains(bodyString, `encoding="UTF-8"`) {
		fmt.Println("📄 API declara encoding UTF-8")
	} else if strings.Contains(bodyString, `encoding="ISO-8859-1"`) {
		fmt.Println("📄 API declara encoding ISO-8859-1")
	}

	// Salvar resposta para análise
	err = os.WriteFile("api_response_raw.xml", bodyBytes, 0644)
	if err == nil {
		fmt.Println("💾 Resposta salva em api_response_raw.xml")
	}
}
