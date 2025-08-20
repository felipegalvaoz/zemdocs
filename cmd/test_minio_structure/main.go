package main

import (
	"fmt"
	"zemdocs/internal/storage"
)

func main() {
	// Simular dados de uma NFS-e
	numeroNfse := "240000093"
	competencia := "202408"
	cnpjPrestador := "32800353000162"

	// Criar cliente MinIO (apenas para demonstrar a geração de paths)
	minioClient := &storage.MinIOClient{}

	// Estrutura antiga
	oldPath := minioClient.GenerateObjectName(numeroNfse, competencia)
	fmt.Printf("📁 Estrutura ANTIGA: %s\n", oldPath)

	// Nova estrutura com CNPJ
	newPath := minioClient.GenerateObjectNameWithCNPJ(numeroNfse, competencia, cnpjPrestador)
	fmt.Printf("📁 Estrutura NOVA:   %s\n", newPath)

	fmt.Println("\n🔍 Detalhes da nova estrutura:")
	fmt.Printf("   - Ano: %s\n", competencia[:4])
	fmt.Printf("   - Mês/Ano: %s%s\n", competencia[4:6], competencia[:4])
	fmt.Printf("   - CNPJ Prestador: %s\n", cnpjPrestador)
	fmt.Printf("   - Arquivo: %s.xml\n", numeroNfse)

	fmt.Println("\n📋 Exemplo de estrutura de diretórios no MinIO:")
	fmt.Println("XML/")
	fmt.Println("└── NFS/")
	fmt.Println("    └── 2024/")
	fmt.Println("        └── 082024/")
	fmt.Println("            └── 32800353000162/")
	fmt.Println("                └── 240000093.xml")
}
