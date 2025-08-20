package utils

import (
	"archive/zip"
	"bytes"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

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

// NFSeXMLData estrutura para extrair dados do XML da NFS-e
type NFSeXMLData struct {
	NumeroNfse                  string
	NumeroRps                   string
	SerieRps                    string
	TipoRps                     int
	DataEmissao                 time.Time
	CodigoVerificacao           string
	ValorServico                float64
	ValorIss                    float64
	ValorDeducoes               float64
	ValorPis                    float64
	ValorCofins                 float64
	ValorInss                   float64
	ValorIr                     float64
	ValorCsll                   float64
	OutrasRetencoes             float64
	BaseCalculo                 float64
	Aliquota                    float64
	Discriminacao               string
	CodigoServico               string
	CodigoMunicipio             string
	ItemListaServico            string
	CNPJPrestador               string
	InscricaoMunicipalPrestador string
	RazaoSocialPrestador        string
	CNPJTomador                 string
	InscricaoMunicipalTomador   string
	RazaoSocialTomador          string
	EnderecoTomador             string
	NumeroTomador               string
	ComplementoTomador          string
	BairroTomador               string
	CidadeTomador               string
	UFTomador                   string
	CEPTomador                  string
}

// convertISO88591ToUTF8 converte string de ISO-8859-1 para UTF-8
func convertISO88591ToUTF8(input string) (string, error) {
	// Se já contém declaração UTF-8, não precisa converter
	if strings.Contains(input, `encoding="UTF-8"`) {
		return input, nil
	}

	// Converter de ISO-8859-1 para UTF-8
	decoder := charmap.ISO8859_1.NewDecoder()
	utf8Bytes, _, err := transform.Bytes(decoder, []byte(input))
	if err != nil {
		return "", fmt.Errorf("erro ao converter encoding: %w", err)
	}

	// Substituir declaração de encoding
	result := string(utf8Bytes)
	result = strings.ReplaceAll(result, `encoding="ISO-8859-1"`, `encoding="UTF-8"`)

	return result, nil
}

// ParseNFSeXML extrai dados estruturados do XML da NFS-e
func ParseNFSeXML(xmlContent string) (*NFSeXMLData, error) {
	// Converter encoding se necessário
	utf8Content, err := convertISO88591ToUTF8(xmlContent)
	if err != nil {
		return nil, fmt.Errorf("erro ao converter encoding: %w", err)
	}
	// Estrutura para fazer parse do XML real de Imperatriz
	type NFSeXML struct {
		XMLName   xml.Name `xml:"consultarNotaResponse"`
		ListaNfse struct {
			ComplNfse struct {
				Nfse struct {
					InfNfse struct {
						Numero            string `xml:"Numero"`
						CodigoVerificacao string `xml:"CodigoVerificacao"`
						DataEmissao       string `xml:"DataEmissao"`
						IdentificacaoRps  struct {
							Numero string `xml:"Numero"`
							Serie  string `xml:"Serie"`
							Tipo   string `xml:"Tipo"`
						} `xml:"IdentificacaoRps"`
						Competencia string `xml:"Competencia"`
						Servico     struct {
							Valores struct {
								ValorServicos    string `xml:"ValorServicos"`
								ValorIss         string `xml:"ValorIss"`
								ValorDeducoes    string `xml:"ValorDeducoes"`
								ValorPis         string `xml:"ValorPis"`
								ValorCofins      string `xml:"ValorCofins"`
								ValorInss        string `xml:"ValorInss"`
								ValorIr          string `xml:"ValorIr"`
								ValorCsll        string `xml:"ValorCsll"`
								OutrasRetencoes  string `xml:"OutrasRetencoes"`
								BaseCalculo      string `xml:"BaseCalculo"`
								Aliquota         string `xml:"Aliquota"`
								ValorLiquidoNfse string `xml:"ValorLiquidoNfse"`
							} `xml:"Valores"`
							ItemListaServico string `xml:"ItemListaServico"`
							CodigoCnae       string `xml:"CodigoCnae"`
							CodigoMunicipio  string `xml:"CodigoMunicipio"`
							IBGE             string `xml:"IBGE"`
							Discriminacao    string `xml:"Discriminacao"`
						} `xml:"Servico"`
						PrestadorServico struct {
							IdentificacaoPrestador struct {
								Cnpj               string `xml:"Cnpj"`
								InscricaoMunicipal string `xml:"InscricaoMunicipal"`
							} `xml:"IdentificacaoPrestador"`
							RazaoSocial  string `xml:"RazaoSocial"`
							NomeFantasia string `xml:"NomeFantasia"`
							Endereco     struct {
								Endereco        string `xml:"Endereco"`
								Numero          string `xml:"Numero"`
								Complemento     string `xml:"Complemento"`
								Bairro          string `xml:"Bairro"`
								CodigoMunicipio string `xml:"CodigoMunicipio"`
								IBGE            string `xml:"IBGE"`
								Cep             string `xml:"Cep"`
							} `xml:"Endereco"`
						} `xml:"PrestadorServico"`
						TomadorServico struct {
							IdentificacaoTomador struct {
								CpfCnpj struct {
									Cnpj string `xml:"Cnpj"`
								} `xml:"CpfCnpj"`
							} `xml:"IdentificacaoTomador"`
							RazaoSocial string `xml:"RazaoSocial"`
							Endereco    struct {
								Endereco        string `xml:"Endereco"`
								Numero          string `xml:"Numero"`
								Complemento     string `xml:"Complemento"`
								Bairro          string `xml:"Bairro"`
								CodigoMunicipio string `xml:"CodigoMunicipio"`
								IBGE            string `xml:"IBGE"`
								Cep             string `xml:"Cep"`
							} `xml:"Endereco"`
						} `xml:"TomadorServico"`
					} `xml:"InfNfse"`
				} `xml:"Nfse"`
			} `xml:"ComplNfse"`
		} `xml:"ListaNfse"`
	}

	var nfseXML NFSeXML
	if err := xml.Unmarshal([]byte(utf8Content), &nfseXML); err != nil {
		return nil, fmt.Errorf("erro ao fazer parse do XML: %w", err)
	}

	// Converter dados usando a estrutura correta
	infNfse := nfseXML.ListaNfse.ComplNfse.Nfse.InfNfse
	data := &NFSeXMLData{
		NumeroNfse:                  infNfse.Numero,
		NumeroRps:                   infNfse.IdentificacaoRps.Numero,
		SerieRps:                    infNfse.IdentificacaoRps.Serie,
		CodigoVerificacao:           infNfse.CodigoVerificacao,
		Discriminacao:               strings.TrimSpace(infNfse.Servico.Discriminacao),
		CodigoServico:               infNfse.Servico.CodigoCnae, // Usando CodigoCnae como CodigoServico
		CodigoMunicipio:             infNfse.Servico.IBGE,       // Usando IBGE como CodigoMunicipio
		ItemListaServico:            infNfse.Servico.ItemListaServico,
		CNPJPrestador:               infNfse.PrestadorServico.IdentificacaoPrestador.Cnpj,
		InscricaoMunicipalPrestador: infNfse.PrestadorServico.IdentificacaoPrestador.InscricaoMunicipal,
		RazaoSocialPrestador:        infNfse.PrestadorServico.RazaoSocial,
		CNPJTomador:                 infNfse.TomadorServico.IdentificacaoTomador.CpfCnpj.Cnpj,
		InscricaoMunicipalTomador:   "", // Não presente na estrutura
		RazaoSocialTomador:          infNfse.TomadorServico.RazaoSocial,
		EnderecoTomador:             infNfse.TomadorServico.Endereco.Endereco,
		NumeroTomador:               infNfse.TomadorServico.Endereco.Numero,
		ComplementoTomador:          infNfse.TomadorServico.Endereco.Complemento,
		BairroTomador:               infNfse.TomadorServico.Endereco.Bairro,
		CidadeTomador:               infNfse.TomadorServico.Endereco.IBGE,
		UFTomador:                   "", // Não presente na estrutura
		CEPTomador:                  infNfse.TomadorServico.Endereco.Cep,
	}

	// Converter valores numéricos usando a estrutura correta
	valores := infNfse.Servico.Valores
	if val, err := parseFloat(valores.ValorServicos); err == nil {
		data.ValorServico = val
	}
	if val, err := parseFloat(valores.ValorIss); err == nil {
		data.ValorIss = val
	}
	if val, err := parseFloat(valores.ValorDeducoes); err == nil {
		data.ValorDeducoes = val
	}
	if val, err := parseFloat(valores.ValorPis); err == nil {
		data.ValorPis = val
	}
	if val, err := parseFloat(valores.ValorCofins); err == nil {
		data.ValorCofins = val
	}
	if val, err := parseFloat(valores.ValorInss); err == nil {
		data.ValorInss = val
	}
	if val, err := parseFloat(valores.ValorIr); err == nil {
		data.ValorIr = val
	}
	if val, err := parseFloat(valores.ValorCsll); err == nil {
		data.ValorCsll = val
	}
	if val, err := parseFloat(valores.OutrasRetencoes); err == nil {
		data.OutrasRetencoes = val
	}
	if val, err := parseFloat(valores.BaseCalculo); err == nil {
		data.BaseCalculo = val
	}
	if val, err := parseFloat(valores.Aliquota); err == nil {
		data.Aliquota = val
	}

	// Converter tipo RPS
	if val, err := strconv.Atoi(infNfse.IdentificacaoRps.Tipo); err == nil {
		data.TipoRps = val
	}

	// Converter data de emissão (formato: 2024-08-29 11:47:15)
	if dt, err := time.Parse("2006-01-02 15:04:05", infNfse.DataEmissao); err == nil {
		data.DataEmissao = dt
	}

	return data, nil
}

// parseFloat converte string para float64, tratando vírgula como separador decimal
func parseFloat(s string) (float64, error) {
	if s == "" {
		return 0, nil
	}
	// Substituir vírgula por ponto
	s = strings.ReplaceAll(s, ",", ".")
	return strconv.ParseFloat(s, 64)
}
