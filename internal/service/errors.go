package service

import "errors"

var (
	ErrUserNotFound = errors.New("usuário não encontrado")
	ErrEmailExists  = errors.New("email já existe")
	ErrInvalidData  = errors.New("dados inválidos")
)
