"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import { useState } from "react"

export function ConfiguracoesAPI() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'idle'>('idle')
  const [isSyncing, setIsSyncing] = useState(false)

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      // TODO: Implementar teste real de conexão
      await new Promise(resolve => setTimeout(resolve, 2000))
      setConnectionStatus('success')
    } catch (error) {
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const forceSyncronization = async () => {
    setIsSyncing(true)
    try {
      // TODO: Implementar sincronização forçada
      await new Promise(resolve => setTimeout(resolve, 3000))
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Não testado
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da API</CardTitle>
        <CardDescription>
          Monitoramento e controle da conexão com a API externa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Status da Conexão</p>
            <p className="text-sm text-muted-foreground">
              Última verificação: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-3">
          <Button
            onClick={testConnection}
            disabled={isTestingConnection}
            variant="outline"
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testando Conexão...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>

          <Button
            onClick={forceSyncronization}
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Forçar Sincronização
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Estatísticas</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Última Sincronização</p>
              <p className="font-medium">Há 15 minutos</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Sincronizado</p>
              <p className="font-medium">1.247 NFS-e</p>
            </div>
            <div>
              <p className="text-muted-foreground">Erros Hoje</p>
              <p className="font-medium text-red-600">0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-medium text-green-600">99.9%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
