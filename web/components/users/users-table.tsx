"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Eye, Edit, MoreHorizontal, Shield, User } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Usuario {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'ativo' | 'inativo'
  created_at: string
  last_login?: string
}

export function UsersTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/users')
        // const data = await response.json()
        
        // Dados simulados
        const mockData: Usuario[] = [
          {
            id: 1,
            name: "Administrador",
            email: "admin@zemdocs.com",
            role: "admin",
            status: "ativo",
            created_at: "2024-01-15T10:30:00Z",
            last_login: "2024-08-20T14:22:00Z"
          },
          {
            id: 2,
            name: "João Silva",
            email: "joao.silva@empresa.com",
            role: "user",
            status: "ativo",
            created_at: "2024-03-22T09:15:00Z",
            last_login: "2024-08-19T16:45:00Z"
          },
          {
            id: 3,
            name: "Maria Santos",
            email: "maria.santos@empresa.com",
            role: "user",
            status: "ativo",
            created_at: "2024-05-10T11:20:00Z",
            last_login: "2024-08-18T08:30:00Z"
          },
          {
            id: 4,
            name: "Pedro Costa",
            email: "pedro.costa@empresa.com",
            role: "user",
            status: "inativo",
            created_at: "2024-02-28T14:45:00Z",
            last_login: "2024-07-15T12:00:00Z"
          }
        ]
        
        setUsuarios(mockData)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    return status === "ativo" ? "default" : "secondary"
  }

  const getRoleIcon = (role: string) => {
    return role === "admin" ? Shield : User
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerenciar usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
        <CardDescription>
          Gerenciar usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => {
                const RoleIcon = getRoleIcon(usuario.role)
                return (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/avatars/${usuario.id}.jpg`} />
                          <AvatarFallback className="text-xs">
                            {getInitials(usuario.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{usuario.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {usuario.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{usuario.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(usuario.status)}>
                        {usuario.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(usuario.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {usuario.last_login ? formatDate(usuario.last_login) : "Nunca"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredUsuarios.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
