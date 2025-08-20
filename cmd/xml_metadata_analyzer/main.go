package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"zemdocs/internal/utils"
)

func main() {
	// Verificar se o arquivo foi fornecido
	if len(os.Args) < 2 {
		log.Fatal("Uso: go run cmd/xml_metadata_analyzer/main.go <arquivo_xml>")
	}

	xmlFile := os.Args[1]

	// Ler o arquivo XML
	file, err := os.Open(xmlFile)
	if err != nil {
		log.Fatal("Erro ao abrir arquivo XML:", err)
	}
	defer file.Close()

	xmlContent, err := io.ReadAll(file)
	if err != nil {
		log.Fatal("Erro ao ler arquivo XML:", err)
	}

	// Fazer parse do XML e extrair metadados
	metadata, err := utils.ParseNFSeXML(string(xmlContent))
	if err != nil {
		log.Fatal("Erro ao fazer parse do XML:", err)
	}

	// Converter metadados para JSON
	metadataJSON, err := json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		log.Fatal("Erro ao converter metadados para JSON:", err)
	}

	// Exibir informações básicas
	fmt.Println("=== ANÁLISE DO XML DA NFS-E ===")
	fmt.Printf("Número NFS-e: %s\n", metadata.NumeroNfse)
	fmt.Printf("Número RPS: %s\n", metadata.NumeroRps)
	fmt.Printf("Série RPS: %s\n", metadata.SerieRps)
	fmt.Printf("Data Emissão: %s\n", metadata.DataEmissao.Format("2006-01-02 15:04:05"))
	fmt.Printf("Código Verificação: %s\n", metadata.CodigoVerificacao)
	fmt.Printf("Valor Serviço: R$ %.2f\n", metadata.ValorServico)
	fmt.Printf("Valor ISS: R$ %.2f\n", metadata.ValorIss)
	fmt.Printf("Discriminação: %s\n", metadata.Discriminacao)
	fmt.Printf("CNPJ Prestador: %s\n", metadata.CNPJPrestador)
	fmt.Printf("Razão Social Prestador: %s\n", metadata.RazaoSocialPrestador)
	fmt.Printf("CNPJ Tomador: %s\n", metadata.CNPJTomador)
	fmt.Printf("Razão Social Tomador: %s\n", metadata.RazaoSocialTomador)

	fmt.Println("\n=== METADADOS COMPLETOS (JSON) ===")
	fmt.Println(string(metadataJSON))

	// Salvar metadados em arquivo JSON
	jsonFileName := fmt.Sprintf("metadata_%s.json", metadata.NumeroNfse)
	if err := os.WriteFile(jsonFileName, metadataJSON, 0644); err != nil {
		log.Printf("Erro ao salvar metadados em arquivo: %v", err)
	} else {
		fmt.Printf("\nMetadados salvos em: %s\n", jsonFileName)
	}
}
