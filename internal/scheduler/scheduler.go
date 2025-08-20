package scheduler

import (
	"context"
	"sync"
	"time"

	"github.com/robfig/cron/v3"
	"zemdocs/internal/logger"
)

// Job representa um job agendado
type Job interface {
	Execute(ctx context.Context) error
	Name() string
}

// Scheduler gerencia jobs agendados
type Scheduler struct {
	cron   *cron.Cron
	jobs   map[string]Job
	ctx    context.Context
	cancel context.CancelFunc
	wg     sync.WaitGroup
	mu     sync.RWMutex
}

// NewScheduler cria uma nova instância do scheduler
func NewScheduler() *Scheduler {
	ctx, cancel := context.WithCancel(context.Background())
	
	return &Scheduler{
		cron:   cron.New(cron.WithSeconds()),
		jobs:   make(map[string]Job),
		ctx:    ctx,
		cancel: cancel,
	}
}

// AddJob adiciona um job ao scheduler
func (s *Scheduler) AddJob(schedule string, job Job) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, err := s.cron.AddFunc(schedule, func() {
		s.executeJob(job)
	})
	
	if err != nil {
		return err
	}

	s.jobs[job.Name()] = job
	logger.Database().Info().
		Str("job", job.Name()).
		Str("schedule", schedule).
		Msg("Job adicionado ao scheduler")

	return nil
}

// executeJob executa um job com tratamento de erro
func (s *Scheduler) executeJob(job Job) {
	s.wg.Add(1)
	defer s.wg.Done()

	start := time.Now()
	logger.Database().Info().
		Str("job", job.Name()).
		Msg("Iniciando execução do job")

	err := job.Execute(s.ctx)
	duration := time.Since(start)

	if err != nil {
		logger.Database().Error().
			Err(err).
			Str("job", job.Name()).
			Dur("duration", duration).
			Msg("Job executado com erro")
	} else {
		logger.Database().Info().
			Str("job", job.Name()).
			Dur("duration", duration).
			Msg("Job executado com sucesso")
	}
}

// Start inicia o scheduler
func (s *Scheduler) Start() {
	s.cron.Start()
	logger.Database().Info().Msg("Scheduler iniciado")
}

// Stop para o scheduler
func (s *Scheduler) Stop() {
	s.cancel()
	s.cron.Stop()
	s.wg.Wait()
	logger.Database().Info().Msg("Scheduler parado")
}

// GetJobs retorna lista de jobs registrados
func (s *Scheduler) GetJobs() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var jobNames []string
	for name := range s.jobs {
		jobNames = append(jobNames, name)
	}
	return jobNames
}

// RemoveJob remove um job do scheduler
func (s *Scheduler) RemoveJob(jobName string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.jobs, jobName)
	logger.Database().Info().
		Str("job", jobName).
		Msg("Job removido do scheduler")
}
