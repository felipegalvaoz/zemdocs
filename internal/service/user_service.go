package service

import (
	"context"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (s *UserService) CreateUser(ctx context.Context, name, email, password string) (*model.User, error) {
	// Verificar se email já existe
	existingUser, _ := s.userRepo.GetByEmail(ctx, email)
	if existingUser != nil {
		return nil, ErrEmailExists
	}

	// Hash da senha (implementar hash real em produção)
	hashedPassword := hashPassword(password)

	user := &model.User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
	}

	err := s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUserByID(ctx context.Context, id int) (*model.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}

func (s *UserService) GetAllUsers(ctx context.Context, limit, offset int) ([]*model.User, error) {
	return s.userRepo.GetAll(ctx, limit, offset)
}

func (s *UserService) UpdateUser(ctx context.Context, id int, name, email string) (*model.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	user.Email = email

	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) DeleteUser(ctx context.Context, id int) error {
	return s.userRepo.Delete(ctx, id)
}

// hashPassword simula hash de senha (usar bcrypt em produção)
func hashPassword(password string) string {
	// TODO: Implementar hash real com bcrypt
	return password + "_hashed"
}
