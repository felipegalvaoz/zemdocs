package storage

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"zemdocs/internal/logger"
)

// MinIOClient cliente para MinIO
type MinIOClient struct {
	client     *minio.Client
	bucketName string
}

// NewMinIOClient cria uma nova instância do cliente MinIO
func NewMinIOClient(endpoint, accessKey, secretKey, bucketName string, useSSL bool) (*MinIOClient, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar cliente MinIO: %w", err)
	}

	minioClient := &MinIOClient{
		client:     client,
		bucketName: bucketName,
	}

	// Criar bucket se não existir
	if err := minioClient.ensureBucket(context.Background()); err != nil {
		return nil, err
	}

	return minioClient, nil
}

// ensureBucket garante que o bucket existe
func (m *MinIOClient) ensureBucket(ctx context.Context) error {
	exists, err := m.client.BucketExists(ctx, m.bucketName)
	if err != nil {
		return fmt.Errorf("erro ao verificar bucket: %w", err)
	}

	if !exists {
		err = m.client.MakeBucket(ctx, m.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("erro ao criar bucket: %w", err)
		}
		logger.Database().Info().Str("bucket", m.bucketName).Msg("Bucket criado com sucesso")
	}

	return nil
}

// UploadXML faz upload de um XML para o MinIO
func (m *MinIOClient) UploadXML(ctx context.Context, objectName string, xmlContent []byte) error {
	reader := strings.NewReader(string(xmlContent))
	
	_, err := m.client.PutObject(ctx, m.bucketName, objectName, reader, int64(len(xmlContent)), minio.PutObjectOptions{
		ContentType: "application/xml",
		UserMetadata: map[string]string{
			"upload-time": time.Now().Format(time.RFC3339),
		},
	})
	
	if err != nil {
		return fmt.Errorf("erro ao fazer upload do XML: %w", err)
	}

	logger.Database().Info().
		Str("bucket", m.bucketName).
		Str("object", objectName).
		Int("size", len(xmlContent)).
		Msg("XML enviado para MinIO")

	return nil
}

// DownloadXML baixa um XML do MinIO
func (m *MinIOClient) DownloadXML(ctx context.Context, objectName string) ([]byte, error) {
	object, err := m.client.GetObject(ctx, m.bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("erro ao baixar XML: %w", err)
	}
	defer object.Close()

	data, err := io.ReadAll(object)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler XML: %w", err)
	}

	return data, nil
}

// DeleteXML remove um XML do MinIO
func (m *MinIOClient) DeleteXML(ctx context.Context, objectName string) error {
	err := m.client.RemoveObject(ctx, m.bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("erro ao deletar XML: %w", err)
	}

	logger.Database().Info().
		Str("bucket", m.bucketName).
		Str("object", objectName).
		Msg("XML removido do MinIO")

	return nil
}

// ListXMLs lista XMLs no MinIO com prefixo
func (m *MinIOClient) ListXMLs(ctx context.Context, prefix string) ([]string, error) {
	var objects []string

	for object := range m.client.ListObjects(ctx, m.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	}) {
		if object.Err != nil {
			return nil, fmt.Errorf("erro ao listar objetos: %w", object.Err)
		}
		objects = append(objects, object.Key)
	}

	return objects, nil
}

// GenerateObjectName gera nome do objeto baseado na NFS-e
func (m *MinIOClient) GenerateObjectName(numeroNfse, competencia string) string {
	year := competencia[:4]
	month := competencia[4:6]
	return fmt.Sprintf("nfse/%s/%s/%s.xml", year, month, numeroNfse)
}

// GetObjectURL gera URL pré-assinada para download
func (m *MinIOClient) GetObjectURL(ctx context.Context, objectName string, expiry time.Duration) (string, error) {
	url, err := m.client.PresignedGetObject(ctx, m.bucketName, objectName, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("erro ao gerar URL: %w", err)
	}

	return url.String(), nil
}
