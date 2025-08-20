package main

import (
	"fmt"
	"os"
	"strings"
	"unicode/utf8"
	"zemdocs/internal/utils"
)

func main() {
	fmt.Println("=== TESTE ESPECÍFICO DE ENCODING ===")
	
	// Ler o arquivo XML real
	data, err := os.ReadFile("nfse_240000093.xml")
	if err != nil {
		fmt.Printf("Erro ao ler arquivo: %v\n", err)
		return
	}
	
	content := string(data)
	
	fmt.Println("1. ARQUIVO ORIGINAL:")
	fmt.Printf("É UTF-8 válido: %v\n", utf8.ValidString(content))
	
	// Procurar por PRESTAÇÃO
	if strings.Contains(content, "PRESTAÇÃO") {
		fmt.Println("✅ Contém 'PRESTAÇÃO' (correto)")
		
		// Encontrar a posição
		start := strings.Index(content, "PRESTAÇÃO")
		if start != -1 {
			end := start + len("PRESTAÇÃO")
			word := content[start:end]
			fmt.Printf("Palavra encontrada: '%s'\n", word)
			fmt.Printf("Bytes da palavra: %v\n", []byte(word))
		}
	}
	
	fmt.Println("\n2. TESTANDO NOSSA FUNÇÃO DE CONVERSÃO:")
	
	// Testar nossa função atual
	converted, err := utils.ParseNFSeXML(content)
	if err != nil {
		fmt.Printf("Erro na conversão: %v\n", err)
	} else {
		fmt.Printf("Discriminação após conversão: '%s'\n", converted.Discriminacao)
		fmt.Printf("Bytes da discriminação: %v\n", []byte(converted.Discriminacao))
		
		if strings.Contains(converted.Discriminacao, "PRESTAÇÃO") {
			fmt.Println("✅ Conversão manteve texto correto")
		} else {
			fmt.Println("❌ Conversão corrompeu o texto")
		}
	}
	
	fmt.Println("\n3. TESTE SEM CONVERSÃO DE ENCODING:")
	
	// Testar sem conversão (assumindo que já está em UTF-8)
	testWithoutConversion(content)
}

func testWithoutConversion(xmlContent string) {
	// Simular parse sem conversão de encoding
	fmt.Println("Testando parse direto (sem conversão de encoding)...")
	
	// Procurar por discriminação no XML
	start := strings.Index(xmlContent, "<Discriminacao>")
	if start != -1 {
		start += len("<Discriminacao>")
		end := strings.Index(xmlContent[start:], "</Discriminacao>")
		if end != -1 {
			discriminacao := xmlContent[start : start+end]
			fmt.Printf("Discriminação extraída diretamente: '%s'\n", discriminacao)
			fmt.Printf("Bytes: %v\n", []byte(discriminacao))
			
			if strings.Contains(discriminacao, "PRESTAÇÃO") {
				fmt.Println("✅ Parse direto mantém texto correto")
			} else {
				fmt.Println("❌ Parse direto também tem problema")
			}
		}
	}
}
