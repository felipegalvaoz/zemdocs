package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"zemdocs/internal/api/router"
	"zemdocs/internal/clientes/nfse"
	"zemdocs/internal/clientes/nfse/ma/imperatriz"
	"zemdocs/internal/config"
	"zemdocs/internal/database"
	"zemdocs/internal/database/repository"
	"zemdocs/internal/handler"
	"zemdocs/internal/jobs"
	"zemdocs/internal/logger"
	"zemdocs/internal/scheduler"
	"zemdocs/internal/service"
	"zemdocs/internal/storage"
)

func main() {
	// Carregar configurações
	cfg, err := config.Load()
	if err != nil {
		panic("Erro ao carregar configurações: " + err.Error())
	}

	// Validar configurações
	if err := cfg.Validate(); err != nil {
		panic("Configurações inválidas: " + err.Error())
	}

	// Inicializar logger
	logger.Init(cfg)
	logger.Info("Iniciando aplicação zemdocs-api")

	// Inicializar banco de dados
	if err := database.InitDB(cfg); err != nil {
		logger.Fatal(err, "Erro ao inicializar banco de dados")
	}
	defer database.CloseDB()

	// Executar migrações automáticas
	if err := database.RunMigrations(context.Background()); err != nil {
		logger.Fatal(err, "Erro ao executar migrações")
	}

	// Inicializar MinIO
	minioClient, err := storage.NewMinIOClient(
		cfg.MinIO.Endpoint,
		cfg.MinIO.AccessKey,
		cfg.MinIO.SecretKey,
		cfg.MinIO.BucketName,
		cfg.MinIO.UseSSL,
	)
	if err != nil {
		logger.Fatal(err, "Erro ao conectar com MinIO")
	}

	// Inicializar repositórios
	nfseRepo := repository.NewNFSeRepository(database.DB)

	// Inicializar registry de clientes NFS-e
	nfseRegistry := nfse.NewRegistry()

	// Registrar cliente de Imperatriz-MA (código IBGE: 2105302)
	imperatrizClient := imperatriz.NewClient(
		cfg.NFSe.ImperatrizBaseURL,
		cfg.NFSe.ImperatrizToken,
	)
	nfseRegistry.Register("2105302", imperatrizClient)

	// Inicializar serviços
	nfseService := service.NewNFSeService(nfseRegistry, nfseRepo, minioClient)

	// Inicializar scheduler se habilitado
	var jobScheduler *scheduler.Scheduler
	if cfg.Scheduler.Enabled {
		jobScheduler = scheduler.NewScheduler()

		// Criar job de sincronização
		syncJob := jobs.NewNFSeSyncJob(
			imperatrizClient,
			nfseRepo,
			minioClient,
			cfg.Scheduler.CompetenciaAtual,
		)

		// Agendar job
		if err := jobScheduler.AddJob(cfg.Scheduler.SyncInterval, syncJob); err != nil {
			logger.Fatal(err, "Erro ao agendar job de sincronização")
		}

		// Iniciar scheduler
		jobScheduler.Start()
		logger.Info("Scheduler iniciado com sucesso")
	}

	// Inicializar handlers
	nfseHandler := handler.NewNFSeHandler(nfseService)

	// Configurar router
	r := router.SetupRouter(nfseHandler)

	// Configurar servidor
	srv := &http.Server{
		Addr:    cfg.Server.Host + ":" + cfg.Server.Port,
		Handler: r,
	}

	// Iniciar servidor em goroutine
	go func() {
		logger.Info("Servidor iniciado na porta " + cfg.Server.Port)
		logger.Info("Health check: http://localhost:" + cfg.Server.Port + "/health")
		logger.Info("API Base URL: http://localhost:" + cfg.Server.Port + "/api/v1")

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal(err, "Erro ao iniciar servidor")
		}
	}()

	// Aguardar sinal de interrupção
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Desligando servidor...")

	// Parar scheduler se estiver rodando
	if jobScheduler != nil {
		logger.Info("Parando scheduler...")
		jobScheduler.Stop()
	}

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal(err, "Erro ao desligar servidor")
	}

	logger.Info("Servidor desligado com sucesso")
}
