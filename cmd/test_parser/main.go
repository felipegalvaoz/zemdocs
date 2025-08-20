package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"zemdocs/internal/utils"
)

func main() {
	// Ler o XML que foi salvo anteriormente
	xmlFile, err := os.Open("nfse_240000093.xml")
	if err != nil {
		log.Fatal("Erro ao abrir arquivo XML:", err)
	}
	defer xmlFile.Close()

	xmlContent, err := io.ReadAll(xmlFile)
	if err != nil {
		log.Fatal("Erro ao ler arquivo XML:", err)
	}

	// Fazer parse do XML
	data, err := utils.ParseNFSeXML(string(xmlContent))
	if err != nil {
		log.Fatal("Erro ao fazer parse do XML:", err)
	}

	// Exibir dados extraídos
	fmt.Printf("=== DADOS EXTRAÍDOS DA NFS-E ===\n")
	fmt.Printf("Número NFS-e: %s\n", data.NumeroNfse)
	fmt.Printf("Código Verificação: %s\n", data.CodigoVerificacao)
	fmt.Printf("Data Emissão: %s\n", data.DataEmissao.Format("02/01/2006 15:04:05"))
	fmt.Printf("Número RPS: %s\n", data.NumeroRps)
	fmt.Printf("Série RPS: %s\n", data.SerieRps)
	fmt.Printf("Tipo RPS: %d\n", data.TipoRps)
	
	fmt.Printf("\n=== VALORES ===\n")
	fmt.Printf("Valor Serviços: R$ %.2f\n", data.ValorServico)
	fmt.Printf("Valor ISS: R$ %.2f\n", data.ValorIss)
	fmt.Printf("Base Cálculo: R$ %.2f\n", data.BaseCalculo)
	fmt.Printf("Alíquota: %.4f%%\n", data.Aliquota)
	fmt.Printf("Valor Deduções: R$ %.2f\n", data.ValorDeducoes)
	
	fmt.Printf("\n=== PRESTADOR ===\n")
	fmt.Printf("CNPJ: %s\n", data.CNPJPrestador)
	fmt.Printf("Inscrição Municipal: %s\n", data.InscricaoMunicipalPrestador)
	fmt.Printf("Razão Social: %s\n", data.RazaoSocialPrestador)
	
	fmt.Printf("\n=== TOMADOR ===\n")
	fmt.Printf("CNPJ: %s\n", data.CNPJTomador)
	fmt.Printf("Razão Social: %s\n", data.RazaoSocialTomador)
	fmt.Printf("Endereço: %s, %s\n", data.EnderecoTomador, data.NumeroTomador)
	fmt.Printf("Complemento: %s\n", data.ComplementoTomador)
	fmt.Printf("Bairro: %s\n", data.BairroTomador)
	fmt.Printf("CEP: %s\n", data.CEPTomador)
	
	fmt.Printf("\n=== SERVIÇO ===\n")
	fmt.Printf("Discriminação: %s\n", data.Discriminacao)
	fmt.Printf("Item Lista Serviço: %s\n", data.ItemListaServico)
	fmt.Printf("Código Serviço: %s\n", data.CodigoServico)
	fmt.Printf("Código Município: %s\n", data.CodigoMunicipio)
}
