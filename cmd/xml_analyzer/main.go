package main

import (
	"archive/zip"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

// ImperatrizAPIResponse estrutura da resposta da API de Imperatriz
type ImperatrizAPIResponse struct {
	RecordCount    int                    `json:"RecordCount"`
	RecordsPerPage int                    `json:"RecordsPerPage"`
	PageCount      int                    `json:"PageCount"`
	CurrentPage    int                    `json:"CurrentPage"`
	Dados          []ImperatrizNFSeRecord `json:"Dados"`
}

// ImperatrizNFSeRecord registro individual da API de Imperatriz
type ImperatrizNFSeRecord struct {
	NrNfse        int    `json:"NrNfse"`
	DtEmissao     string `json:"DtEmissao"`
	NrCompetencia int    `json:"NrCompetencia"`
	XmlCompactado string `json:"XmlCompactado"`
}

// DecompressXML descompacta XML que está em Base64 + ZIP
func DecompressXML(compressedData string) (string, error) {
	// Decodificar Base64
	zipData, err := base64.StdEncoding.DecodeString(compressedData)
	if err != nil {
		return "", fmt.Errorf("erro ao decodificar base64: %w", err)
	}

	// Criar reader para ZIP
	zipReader, err := zip.NewReader(bytes.NewReader(zipData), int64(len(zipData)))
	if err != nil {
		return "", fmt.Errorf("erro ao criar zip reader: %w", err)
	}

	// Deve ter apenas um arquivo no ZIP
	if len(zipReader.File) == 0 {
		return "", fmt.Errorf("arquivo ZIP vazio")
	}

	// Ler o primeiro arquivo
	file := zipReader.File[0]
	fileReader, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("erro ao abrir arquivo no ZIP: %w", err)
	}
	defer fileReader.Close()

	// Ler conteúdo XML
	xmlData, err := io.ReadAll(fileReader)
	if err != nil {
		return "", fmt.Errorf("erro ao ler XML: %w", err)
	}

	return string(xmlData), nil
}

func main() {
	// Usar dados reais da produção que já funcionaram
	jsonData := `{"RecordCount":12,"RecordsPerPage":100,"PageCount":1,"CurrentPage":1,"Dados":[{"NrNfse":240000093,"DtEmissao":"2024-08-29 11:47:15","NrCompetencia":202408,"XmlCompactado":"UEsDBBQAAAAIAPClE1tO50N\/zAQAAHoUAAAlAAAAOTc1NTc1XzI0MDAwMDA5MzIwMjUwODE5MjA0NzMyODU5LnhtbN1YzXKjRhC+pyrvMKW7zIDQD1ssWwjhBK8WHJBVuY5htEUKGIVBrqyvOeyD5FH8YulBWALZ\/CjJKS5Xienpv+npr7tB\/\/RHmqAnmvOYZR9H8g0eIZqFLIqzrx9HTuCNF4upNpZHiBcki0jCMvpx9I3y0SdDD1nGD0lBcpcVxKd8D2tq6OsYeN2deLRYuk\/Kxx9\/QG\/+9NYd2HOyXce2ED6kNGeGomLxp010qaK0SlhwrK9sS\/N4F4ckJMyIMFajKNQIJUR9nD7OaAT6HqOFRneL2Rzr0luZVvUm53FGikNO7nMKIYhYvmGp+DFUz78d\/\/qLstSlDq5WzStSEDuNOQfzClbUMV6MFQ3J8gd1\/kGe6lKdoVWLE9GseD2Gv+etnOfg9sYUWAOIDTXc22Bs69Jx0cG9ifdCbfnT6qk02NV6aAQfasSiU9IVl0CfibeneXmxIoMuaahV3NsDIAoaxJDhlLskBACRxJB1qWWnIy3TPS0AdTExFE3CC0nc8el2byZzrCkTkYpnvna3DkVOOICH5SkJGeUQ7Le0VnG4v6c47LzvLRSBvENHna1Sxw11qt5oC11qUoeoWNHoUPqMbzCuFJxoQxTcxw1ZsRwiZrFdnDUkK8oQYSfjDdFyPUgwb4i114SGqzxJGo6KdY+gw7lPiziCggJwOy0G+Xhxtv6jHRPQL5P3fJWX1B4lS8KpRZLwkLBTOtVpPeJmEv9+gD5VGhfmT4QhZ14DL8Sn7EiNXK5v9ChaUQ4ds2AWy6K4LAoQ8GMo3t0aqM6B6LUqvNjsgLXUj2vdKWhadvfXMiFjLNLnktyh4thPrYxQY65qeCxLWH3tsiW1Q3YV8zCPU2ifojTf+3awMV++v\/zpoZWNAtvfOi\/fPTh7g63Xly+HDOKzj+E0ytmXM7UrHsufbEOR8XRShkGsulqf98VYYCjk4qFl6pG6Q6ifZoYBoW400ZNgX1pZ2f43Y6IsMJ7AsTCWZ3C0kthXUTIRdjBVhQ5anjafTucwnryz1ZWJVzuu++SZsIBBZ0yMuxsE\/1vbsR7WXoDWm5WpS3WGrrGHpfQWmjfh0GPv0N1JDYwG9a0OFXYW0Zx23kyTb0nzjOQRQwH59vIX06WhGqrRTFbU2YA5rRQp53GaQnjFEFZf9RbfOAf1LnsiyEnFdFTk8bMowCW91+y\/A1qp5CqwlRIDAHd2ke6N2VTD87I3iFVXhvZckS4NxKlejf7XornvjeH1UPtdidwjqAHQ6kyZyQLUeFGBGn4qpsGI7DfewKNl+ivnFq08tPTNwFmjrbMykY2gfsOT7VqOiQJpOEavBpi5tV1hUjQMYXBjo7uHwLLXjuuhzw9LZxNYP9ufkaxh7Xr0lULXo2\/j+T40rYd1jcF0V6aP5hCbxYWo5bl3CM3lpdiT\/wlyt87aRK63NYUuC6qa6f3P0Atj2QTw+x+AdwAoRU9r+z4B6dCyIegWyUKakPa7g3hnu1i8qbVOL\/o9jbqmdfHx5MjSa+1VoA7w47cb6S2tazaDt+6GseOL+FD70jUeQ3ntOr84fS2Gg1zQg0NIOWfGjiScwhhWLdscuM6EQEvHnR4TpltJmTvB4ZEXcXGIW1JDrzNUt\/iG1GK+W3dVctoUnD\/5vbP5\/mfCvwFQSwECFAMUAAAACADwpRNbTudDf8wEAAB6FAAAJQAAAAAAAAAAAAAAgAEAAAAAOTc1NTc1XzI0MDAwMDA5MzIwMjUwODE5MjA0NzMyODU5LnhtbFBLBQYAAAAAAQABAFMAAAAPBQAAAAA="}]}`

	// Decodificar JSON
	var apiResp ImperatrizAPIResponse
	if err := json.Unmarshal([]byte(jsonData), &apiResp); err != nil {
		log.Fatal("Erro ao decodificar JSON:", err)
	}

	fmt.Printf("Total de registros: %d\n", apiResp.RecordCount)
	fmt.Printf("Registros por página: %d\n", apiResp.RecordsPerPage)
	fmt.Printf("Total de páginas: %d\n", apiResp.PageCount)
	fmt.Printf("Página atual: %d\n", apiResp.CurrentPage)
	fmt.Printf("Registros encontrados: %d\n\n", len(apiResp.Dados))

	// Analisar alguns XMLs
	for i, record := range apiResp.Dados {
		if i >= 3 { // Analisar apenas os 3 primeiros
			break
		}

		fmt.Printf("=== NFS-e %d ===\n", record.NrNfse)
		fmt.Printf("Data Emissão: %s\n", record.DtEmissao)
		fmt.Printf("Competência: %d\n", record.NrCompetencia)

		// Descompactar XML
		xmlContent, err := DecompressXML(record.XmlCompactado)
		if err != nil {
			fmt.Printf("Erro ao descompactar XML: %v\n\n", err)
			continue
		}

		// Salvar XML em arquivo para análise
		filename := fmt.Sprintf("nfse_%d.xml", record.NrNfse)
		if err := os.WriteFile(filename, []byte(xmlContent), 0644); err != nil {
			fmt.Printf("Erro ao salvar XML: %v\n", err)
		} else {
			fmt.Printf("XML salvo em: %s\n", filename)
		}

		// Mostrar início do XML
		if len(xmlContent) > 500 {
			fmt.Printf("Início do XML:\n%s...\n\n", xmlContent[:500])
		} else {
			fmt.Printf("XML completo:\n%s\n\n", xmlContent)
		}
	}
}
